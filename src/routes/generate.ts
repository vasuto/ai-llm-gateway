// POST /v1/generate
import { Request, Response } from "express"
import { validateGenerateRequest } from "../utils/validation"
import { generate } from "../services/generate"


export async function generateHandler(req: Request, res: Response) {
  const start = process.hrtime.bigint()

  try {
    const input = validateGenerateRequest(req.body)
    const {response, providerDurationMs} = await generate(input, {
      idempotencyKey: req.header("Idempotency-Key") ?? null,
    })

    const latencyMs = Number(process.hrtime.bigint() - start) / 1_000_000

    console.log(
      JSON.stringify({
        requestId: response.id,
        latencyMs,
        cached: response.cached,
        blocked: response.blocked,
        providerDurationMs,
      })
    )
    res.json(response)
  } catch (err: any) {
    res.status(400).json({ error: err.message })
  }
}
