// LLM provider interface
export interface LLMProvider {
  generate(input: GenerateInput): Promise<{
    output: string
    model: string
    usage: {
      inputTokens: number
      outputTokens: number
    }
  }>
}

export interface GenerateInput {
  prompt: string
  maxTokens: number
  temperature: number
}
