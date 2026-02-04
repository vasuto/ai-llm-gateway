import crypto from "crypto"

export function hashObject(obj: unknown): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(obj))
    .digest("hex")
}
