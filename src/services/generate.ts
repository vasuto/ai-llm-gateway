import { randomUUID } from "crypto"
import { TTLCache } from "../infra/cache"
import { IdempotencyStore } from "../infra/idempotency"
import { createProvider } from "../infra/providers"
import { hashObject } from "../utils/hash"
import { checkPrompt } from "../domain/policy"
import { GenerateResponse } from "../types/api"
import { GenerateInput, LLMProvider } from "../domain/provider"

const cache = new TTLCache<GenerateResponse>()
const idempotencyStore = new IdempotencyStore<GenerateResponse>()
const inProgress = new Map<string, Promise<GenerateOutput>>() // dedupe concurrent requests
export function resetStoresForTest() {
  cache.clear?.()
  idempotencyStore.clear?.()
  inProgress.clear()
}
let provider: LLMProvider | null = null
export function setProviderForTest(p: LLMProvider) {
  provider = p
}

function getProvider(): LLMProvider {
  if (!provider) {
    provider = createProvider() // only run in production
    console.log("Using provider:", provider.constructor.name)
  }
  return provider
}

export interface GenerateOutput {
  response: GenerateResponse
  providerDurationMs?: number
}

const CACHE_ENTRY_TTL_MS = 10 * 60 * 1000

export async function generate(
  input: GenerateInput,
  context: { idempotencyKey: string | null }
): Promise<GenerateOutput> {

  const cacheKey = hashObject({
    prompt: input.prompt,
    maxTokens: input.maxTokens,
    temperature: input.temperature,
  })
  
  const cached = cache.get(cacheKey)
  if (cached) {
    const response = { ...cached, cached: true }
    return { response }
  }

  if (inProgress.has(cacheKey)) {
    return await inProgress.get(cacheKey)!
  }

  const bodyHash = hashObject(input)
  const idempoKey = context.idempotencyKey
    ? `${context.idempotencyKey}:${bodyHash}`
    : null

  if (idempoKey) {
    const existing = idempotencyStore.get(idempoKey)
    if (existing) {
      return { response: existing }
    }
  }

  const policy = checkPrompt(input.prompt)
  if (policy.blocked) {
    const response: GenerateResponse = {
      id: randomUUID(),
      output: "",
      model: "",
      cached: false,
      usage: { inputTokens: 0, outputTokens: 0 },
      blocked: true,
      blockReason: policy.reason,
    }

    if (idempoKey) {
      idempotencyStore.set(idempoKey, response)
    }
    return { response }
  }

  const providerPromise = (async (): Promise<GenerateOutput> => {
    const providerStart = process.hrtime.bigint()
    const result = await getProvider().generate(input)
    const providerDurationMs =
      Number(process.hrtime.bigint() - providerStart) / 1_000_000

    const response: GenerateResponse = {
      id: randomUUID(),
      output: result.output,
      model: result.model,
      cached: false,
      usage: result.usage,
      blocked: false,
      blockReason: null,
    }

    cache.set(cacheKey, response, CACHE_ENTRY_TTL_MS)
    if (idempoKey) {
      idempotencyStore.set(idempoKey, response)
    }

    return {
      response,
      providerDurationMs
    }
  })()

  inProgress.set(cacheKey, providerPromise)

  try {
    return await providerPromise
  } finally {
    inProgress.delete(cacheKey)
  }
}
