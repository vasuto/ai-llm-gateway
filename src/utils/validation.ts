export function validateGenerateRequest(body: any) {
  if (!body || typeof body.prompt !== "string" || body.prompt.length === 0) {
    throw new Error("Invalid prompt")
  }

  const maxTokens =
    body.maxTokens === undefined ? 256 : Number(body.maxTokens)
  const temperature =
    body.temperature === undefined ? 0.2 : Number(body.temperature)

  if (!Number.isInteger(maxTokens) || maxTokens <= 0 || maxTokens > 2048) {
    throw new Error("Invalid maxTokens")
  }

  if (Number.isNaN(temperature) || temperature < 0 || temperature > 1) {
    throw new Error("Invalid temperature")
  }

  return { prompt: body.prompt, maxTokens, temperature }
}
