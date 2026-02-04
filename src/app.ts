// HTTP server wiring
import express from "express"
import { generateHandler } from "./routes/generate"
import { healthHandler } from "./routes/health"

export const app = express()
app.use(express.json())

app.post("/v1/generate", generateHandler)
app.get("/health", healthHandler)
