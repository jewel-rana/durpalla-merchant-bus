/** Read a field that may come back camelCase or snake_case. */
export function pick<T = unknown>(o: unknown, ...keys: string[]): T | undefined {
  if (!o || typeof o !== "object") return undefined;
  const r = o as Record<string, unknown>;
  for (const k of keys) if (r[k] !== undefined && r[k] !== null) return r[k] as T;
  return undefined;
}
