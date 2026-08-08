/** Short, collision-safe enough ids for locally stored records. */
export function createId(prefix = 'r'): string {
  const globalCrypto = globalThis.crypto;
  if (globalCrypto?.randomUUID) {
    return `${prefix}_${globalCrypto.randomUUID().replace(/-/g, '').slice(0, 16)}`;
  }
  const random = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${Date.now().toString(36)}${random}`;
}
