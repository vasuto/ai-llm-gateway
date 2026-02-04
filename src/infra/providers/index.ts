// src/infra/providers/index.ts
import { LLMProvider } from "../../domain/provider"
import { MockProvider } from "./mockProvider"
import "dotenv/config"

export function createProvider(): LLMProvider {
  const openAiKey = process.env.OPENAI_API_KEY
  const hfKey = process.env.HUGGING_FACE_API_KEY

  if (openAiKey) {
    // Lazy import avoids SyntaxError in tests
    const { OpenAIProvider } = require("./openAIProvider")
    return new OpenAIProvider(openAiKey)
  }
  if (hfKey) {
    // Lazy import avoids SyntaxError in tests
    const { HuggingFaceProvider } = require("./huggingFaceProvider")
    return new HuggingFaceProvider(hfKey)
  }
  return new MockProvider()
}
