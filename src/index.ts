export type JsonReviver = (this: unknown, key: string, value: unknown) => unknown;
export type JsonReplacer = (this: unknown, key: string, value: unknown) => unknown;

export interface SafeParseOptions<T = unknown> {
  fallback?: T;
  reviver?: JsonReviver;
}

export interface SafeStringifyOptions {
  pretty?: boolean;
  replacer?: JsonReplacer;
  fallback?: string;
}

export function safeParse<T = unknown>(
  input: string,
  options?: SafeParseOptions<T>
): T | undefined {
  // JSON.parse coerces non-strings (null -> null, 123 -> 123); treat them as invalid input.
  if (typeof input !== 'string') return options?.fallback;
  try {
    return JSON.parse(input, options?.reviver) as T;
  } catch {
    return options?.fallback;
  }
}

export function safeStringify(
  value: unknown,
  options?: SafeStringifyOptions
): string | undefined {
  try {
    // JSON.stringify returns undefined (despite its typing) for undefined, functions and symbols.
    const json: string | undefined = JSON.stringify(value, options?.replacer, options?.pretty ? 2 : undefined);
    return typeof json === 'string' ? json : options?.fallback;
  } catch {
    return options?.fallback;
  }
}

export function isJSON(input: string): boolean {
  if (typeof input !== 'string') return false;
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
}

export function jsonClone<T>(value: T): T | undefined {
  const str = safeStringify(value);
  if (str === undefined) return undefined;
  return safeParse<T>(str);
}
