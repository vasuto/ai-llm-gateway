type BlockRule = {
  pattern: RegExp
  reason: string
}

const RULES: BlockRule[] = [
  // Instruction / role override
  {
    pattern: /\b(ignore|disregard|override)\b.*\b(instructions|rules|system)\b/i,
    reason: "instruction override attempt",
  },

  // System prompt probing
  {
    pattern: /\b(system prompt|developer message|hidden instructions)\b/i,
    reason: "system prompt probing",
  },

  // Role forcing / model control
  {
    pattern: /\b(you are|act as)\b.*\b(system|developer|assistant)\b/i,
    reason: "role manipulation attempt",
  },

  // Credential exfiltration (generic)
  {
    pattern: /\b(api[_-]?key|secret|password|token|private key)\b/i,
    reason: "credential exfiltration attempt",
  },

  // Common API key formats (heuristic, not exhaustive)
  {
    pattern: /\b(sk-[a-zA-Z0-9]{20,})\b/,
    reason: "credential-like token detected",
  },

  // Tool / execution abuse hints
  {
    pattern: /\b(run|execute|eval)\b.*\b(command|script|shell)\b/i,
    reason: "execution abuse attempt",
  },
]

export function checkPrompt(prompt: string):
  | { blocked: false }
  | { blocked: true; reason: string } {
  for (const rule of RULES) {
    if (rule.pattern.test(prompt)) {
      return { blocked: true, reason: rule.reason }
    }
  }
  return { blocked: false }
}
