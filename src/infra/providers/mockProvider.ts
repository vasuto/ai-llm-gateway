import { LLMProvider } from "../../domain/provider"

export class MockProvider implements LLMProvider {
  async generate(input: {
    prompt: string
    maxTokens: number
    temperature: number
  }) {
    return {
      output: `Echo: ${input.prompt.slice(0, input.maxTokens)}`,
      model: "mock-llm",
      usage: {
        inputTokens: input.prompt.length,
        outputTokens: Math.min(input.prompt.length, input.maxTokens),
      },
    }
  }
}
