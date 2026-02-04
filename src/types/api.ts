// request/response types
export interface GenerateRequest {
  prompt: string
  maxTokens?: number
  temperature?: number
}

export interface GenerateResponse {
  id: string
  output: string
  model: string
  cached: boolean
  usage: {
    inputTokens: number
    outputTokens: number
  }
  blocked: boolean
  blockReason: string | null
}

