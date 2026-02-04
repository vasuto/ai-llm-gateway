# LLM Gateway Service (AI-assisted)

A small HTTP service exposing a controlled interface to an LLM providers.

The implementation was developed with assistance from an AI coding tool and then manually reviewed and corrected to ensure correctness, safety, and clean engineering practices.

---

## Features

- `POST /v1/generate` endpoint
- Basic prompt blocking policy
- Idempotency via `Idempotency-Key` header
- 10-minute response caching
- Swappable LLM provider abstraction
- Structured request logging
- `/health` endpoint
- Input validation and concurrency-safe behavior

---

## Requirements

- Node.js 18+

---

## How to run

Install dependencies:
```
npm install
```
Run in development mode:
```
npm run dev
```
The server starts on http://localhost:3000.

Run tests:
```
npm test
```
You can chose the LLM Provider by setting up environment variable

- no env var - Mock Provider is used
- HUGGING_FACE_API_KEY - Hugging Face Provider is used
- OPENAI_API_KEY - Open API Provider is used

## Demo

Online demo is availavle on https://ai-llm-gateway.onrender.com
see
- https://ai-llm-gateway.onrender.com/health
- https://ai-llm-gateway.onrender.com/v1/generate

## Endpoints

Project contains Postman collection so endpoints can be tested from there as well.

### Health check endpoint /health
```
curl http://localhost:3000/health
```
```
{ "status": "ok" }
```
### Generate text endpoint /v1/generate
```
curl -X POST http://localhost:3000/v1/generate \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: test-123" \
  -d '{
    "prompt": "hello world",
    "maxTokens": 50,
    "temperature": 0.2
  }'
```
```
{
  "id": "06669804-f1c0-4e6d-982f-57138bd1779e",
  "output": "Echo: hello world",
  "model": "mock-llm",
  "cached": false,
  "usage": {
    "inputTokens": 11,
    "outputTokens": 11
  },
  "blocked": false,
  "blockReason": null
}
```
Example using Hugging Face Provider
POST http://localhost:3000/v1/generate

Request:
```
{
  "prompt": "Tell a short joke about AI.",
  "maxTokens": 10,
  "temperature": 0.5
}
```
Response:
```
{
    "id": "828386d4-fe96-417c-a12d-6c4a454cc50c",
    "output": "Why did the AI go to the gym?\n\nBecause it wanted to improve its *neural* weights!",
    "model": "openai/gpt-oss-20b:together",
    "cached": false,
    "usage": {
        "inputTokens": 6,
        "outputTokens": 16
    },
    "blocked": false,
    "blockReason": null
}
```
Repeating the same request with the same Idempotency-Key returns the same id and sets cached=true.

## AI tool used
ChatGPT, running on GPT-5.2 - https://chatgpt.com/

## AI issues found and corrected

- Cached response
AI returned same responses (for the generate text request) with the cached=false to keep the indeponency but failed to fullfill the assignment request to marke whether ther response is coming from cache or not marked by the flag Indicate cached=true/false in the response.

- Correct wrong order when first it saved it to the indepotency store and looking to the cache was in the end. 

- Extract out the generation from the handler to the generate service.

- Remove unnecessary files
src/domain/generation
src/infra/logging
src/utils/timing

- Fix suggested deprecated API for integration with Hugging Face.

- Improve the original blocking policy.

- Improve some error handling to not expose direct error message to the user.

- Limit max temperature to 1 instead of suggested 2

- Add response deduplication for concurrent requests


## Time spend so far
- 1h - setup the project, generate solution, fix the cached response
- 1,5h - exploring and experimenting with AI providers (usable free tier, quota limits, Hugging Face, OpenAI) using different models
- 1h - testing, fixing, refactoring
- 30m - deployment, chosing provider, testing
- 30m - testing concurrency, fixing and adding deduplication


