// Idempotency store
export class IdempotencyStore<T> {
  private store = new Map<string, T>()

  get(key: string): T | null {
    return this.store.get(key) ?? null
  }

  set(key: string, value: T): void {
    this.store.set(key, value)
  }

  clear() {
    this.store.clear()
  }
}

