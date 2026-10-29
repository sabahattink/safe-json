import { describe, it, expect } from 'vitest';
import { safeParse, safeStringify, isJSON, jsonClone } from '../src/index';

describe('safeParse', () => {
  it('should parse valid JSON', () => {
    expect(safeParse('{"valid": true}')).toEqual({ valid: true });
  });

  it('should return undefined for invalid JSON', () => {
    expect(safeParse('invalid json')).toBeUndefined();
  });

  it('should return fallback for invalid JSON', () => {
    expect(safeParse('invalid', { fallback: {} })).toEqual({});
  });

  it('should parse with type parameter', () => {
    interface User { name: string }
    const result = safeParse<User>('{"name":"John"}');
    expect(result?.name).toBe('John');
  });

  it('should support reviver function', () => {
    const result = safeParse('{"val": 1}', {
      reviver: (key, value) => key === 'val' ? value * 10 : value,
    });
    expect(result).toEqual({ val: 10 });
  });

  it('should return fallback for empty or whitespace-only input', () => {
    expect(safeParse('', { fallback: 'fb' })).toBe('fb');
    expect(safeParse('   ', { fallback: 'fb' })).toBe('fb');
  });

  it('should return fallback when the reviver throws', () => {
    const result = safeParse('{"a": 1}', {
      fallback: 'fb',
      reviver: () => {
        throw new Error('boom');
      },
    });
    expect(result).toBe('fb');
  });

  it('should return fallback for non-string input instead of coercing it', () => {
    // e.g. safeParse(localStorage.getItem('key'), { fallback: [] }) from plain JS
    expect(safeParse(null as unknown as string, { fallback: [] })).toEqual([]);
    expect(safeParse(undefined as unknown as string, { fallback: 'fb' })).toBe('fb');
    expect(safeParse(123 as unknown as string, { fallback: 'fb' })).toBe('fb');
    expect(safeParse(null as unknown as string)).toBeUndefined();
  });
});

describe('safeStringify', () => {
  it('should stringify valid objects', () => {
    expect(safeStringify({ key: 'value' })).toBe('{"key":"value"}');
  });

  it('should return undefined for circular references', () => {
    const obj: any = {};
    obj.self = obj;
    expect(safeStringify(obj)).toBeUndefined();
  });

  it('should return fallback for circular references', () => {
    const obj: any = {};
    obj.self = obj;
    expect(safeStringify(obj, { fallback: '{}' })).toBe('{}');
  });

  it('should pretty print when option is set', () => {
    const result = safeStringify({ a: 1 }, { pretty: true });
    expect(result).toBe('{\n  "a": 1\n}');
  });

  it('should return fallback for BigInt values', () => {
    expect(safeStringify({ a: BigInt(1) }, { fallback: '{}' })).toBe('{}');
  });

  it('should support replacer function', () => {
    const result = safeStringify({ a: 1, b: 2 }, {
      replacer: (key, value) => (key === 'b' ? undefined : value),
    });
    expect(result).toBe('{"a":1}');
  });

  it('should return fallback when the value produces no JSON', () => {
    expect(safeStringify(undefined, { fallback: 'null' })).toBe('null');
    expect(safeStringify(() => 1, { fallback: 'null' })).toBe('null');
    expect(safeStringify(Symbol('s'), { fallback: 'null' })).toBe('null');
    expect(safeStringify(undefined)).toBeUndefined();
  });
});

describe('isJSON', () => {
  it('should return true for valid JSON', () => {
    expect(isJSON('{"valid": true}')).toBe(true);
    expect(isJSON('"string"')).toBe(true);
    expect(isJSON('123')).toBe(true);
    expect(isJSON('null')).toBe(true);
  });

  it('should return false for invalid JSON', () => {
    expect(isJSON('not json')).toBe(false);
    expect(isJSON('{incomplete')).toBe(false);
    expect(isJSON('')).toBe(false);
  });

  it('should return false for non-string input', () => {
    expect(isJSON(null as unknown as string)).toBe(false);
    expect(isJSON(123 as unknown as string)).toBe(false);
    expect(isJSON(undefined as unknown as string)).toBe(false);
  });
});

describe('jsonClone', () => {
  it('should deep clone an object', () => {
    const original = { a: 1, b: { c: 2 } };
    const cloned = jsonClone(original);
    expect(cloned).toEqual(original);
    expect(cloned).not.toBe(original);
    if (cloned) {
      cloned.b.c = 99;
      expect(original.b.c).toBe(2);
    }
  });

  it('should return undefined for non-serializable values', () => {
    const obj: any = {};
    obj.self = obj;
    expect(jsonClone(obj)).toBeUndefined();
  });
});
