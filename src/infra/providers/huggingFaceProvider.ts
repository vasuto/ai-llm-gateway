import fetch from "node-fetch"
import { LLMProvider } from "../../domain/provider"
import { get_encoding } from "@dqbd/tiktoken";


interface HuggingFaceChatMessage {
  role: "assistant" | "user" | "system";
  content: string;
}

interface HuggingFaceChoice {
  index: number;
  message: HuggingFaceChatMessage;
  finish_reason: string;
}

interface HuggingFaceChatCompletion {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: HuggingFaceChoice[];
}


export class HuggingFaceProvider implements LLMProvider {
  constructor(private token: string, private model = "openai/gpt-oss-20b:together") {}

  async generate({ prompt, maxTokens, temperature }: { prompt: string; maxTokens: number; temperature: number }) {
    const res = await fetch(`https://router.huggingface.co/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.model,
        messages: [{ role: "user", content: prompt }],
        temperature: temperature,
        max_new_tokens: maxTokens,
      }),
    })

    if (!res.ok) {
      const errorText = await res.text()

      console.error("Provider request failed", {
        status: res.status,
        body: errorText,
      })

      throw new Error(
        `Provider request failed with HTTP error (${res.status})`
      )
    }
    
    const data = await res.json() as HuggingFaceChatCompletion;
    
    const output = data.choices?.[0]?.message?.content;
    
    if (!output) {
      throw new Error("No assistant content returned");
    }  

    const enc = get_encoding("cl100k_base")
    const inputTokens = enc.encode(prompt).length
    const outputTokens = enc.encode(output).length
    enc.free()

    return {
      output,
      model: this.model,
      usage: { inputTokens, outputTokens },
    }
  }
}
