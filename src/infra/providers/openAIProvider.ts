import OpenAI from "openai"
import { LLMProvider } from "../../domain/provider"

export class OpenAIProvider implements LLMProvider {
  private client: OpenAI
  private model: string

  constructor(apiKey: string, model = "gpt-3.5-turbo") {
    this.client = new OpenAI({ apiKey })
    this.model = model
  }

  async generate(input: {
    prompt: string
    maxTokens: number
    temperature: number
  }) {
    const response = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: "user", content: input.prompt }
      ],
      max_tokens: input.maxTokens,
      temperature: input.temperature,
    })

    const choice = response.choices[0]

    return {
      output: choice.message?.content ?? "",
      model: response.model,
      usage: {
        inputTokens: response.usage?.prompt_tokens ?? 0,
        outputTokens: response.usage?.completion_tokens ?? 0,
      },
    }
  }
}
