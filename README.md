<div align="center">
  <br>
  <h1>safe-json</h1>
  <p><strong>JSON.parse that never throws</strong></p>
  <br>
  <p>
    <a href="https://www.npmjs.com/package/@scuton/safe-json"><img src="https://img.shields.io/npm/v/@scuton/safe-json?color=2563eb&label=npm" alt="npm"></a>
    <a href="https://www.npmjs.com/package/@scuton/safe-json"><img src="https://img.shields.io/npm/dm/@scuton/safe-json?color=gray&label=downloads" alt="downloads"></a>
    <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-green" alt="license"></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/types-TypeScript-3178c6" alt="typescript"></a>
  </p>
  <br>
</div>

> JSON.parse that never throws. Returns a default value instead of crashing your app.

## Highlights

- ✅ Never throws — returns `undefined` or your fallback value
- ✅ Fallback values — provide a default when parsing fails
- ✅ TypeScript generics — `safeParse<User>(str)` returns `User | undefined`
- ✅ `isJSON` guard — check if a string is valid JSON without parsing
- ✅ `jsonClone` — deep clone any serializable value
- ✅ Handles circular references in `safeStringify`
- ✅ Zero dependencies

## Install

```sh
npm install @scuton/safe-json
```

## Usage

### Parsing

```typescript
import { safeParse } from '@scuton/safe-json';

// Valid JSON
safeParse('{"name": "John", "age": 30}');
// { name: 'John', age: 30 }

// Invalid JSON — no crash
safeParse('not valid json');
// undefined

// Invalid JSON with fallback
safeParse('not valid json', { fallback: {} });
// {}

// With TypeScript generics
interface User {
  name: string;
  age: number;
}
const user = safeParse<User>('{"name": "John", "age": 30}');
// user is User | undefined
```

### Stringifying

```typescript
import { safeStringify } from '@scuton/safe-json';

// Normal object
safeStringify({ key: 'value' });
// '{"key":"value"}'

// Circular reference — no crash
const obj: any = { name: 'test' };
obj.self = obj;
safeStringify(obj);
// undefined (instead of throwing)

// Pretty print
safeStringify({ name: 'John', age: 30 }, { pretty: true });
// '{\n  "name": "John",\n  "age": 30\n}'
```

### Utilities

```typescript
import { isJSON, jsonClone } from '@scuton/safe-json';

// Check if string is valid JSON
isJSON('{"valid": true}');   // true
isJSON('not json');          // false

// Deep clone
const original = { nested: { value: 1 } };
const clone = jsonClone(original);
clone.nested.value = 99;
console.log(original.nested.value); // 1 (unchanged)
```

## API

### safeParse(input, options?)

Parse a JSON string safely. Returns `undefined` (or `fallback`) on error or when `input` is not a string (e.g. `null` from `localStorage.getItem`).

#### input

Type: `string`

The JSON string to parse.

#### options.fallback

Type: `T`

Value to return when parsing fails.

#### options.reviver

Type: `(key: string, value: unknown) => unknown`

A reviver function, same as `JSON.parse`'s second argument.

### safeStringify(value, options?)

Stringify a value safely. Returns `undefined` (or `fallback`) on error (circular references, BigInt) or when the value has no JSON representation (`undefined`, functions, symbols).

#### value

Type: `unknown`

The value to stringify.

#### options.pretty

Type: `boolean`\
Default: `false`

Indent output with 2 spaces.

#### options.replacer

Type: `(key: string, value: unknown) => unknown`

A replacer function, same as `JSON.stringify`'s second argument.

#### options.fallback

Type: `string`

Value to return when stringify fails (e.g., circular references).

### isJSON(input)

Returns `true` if the string is valid JSON, `false` otherwise.

### jsonClone(value)

Deep clone a value via JSON serialization. Returns `undefined` if the value is not serializable.

## FAQ

### Why not just use try/catch?

You absolutely can. But if you're parsing JSON in 10 places, that's 10 try/catch blocks. `safeParse` reduces it to one function call with a predictable return type.

### What about performance?

`safeParse` is a thin wrapper around `JSON.parse`. The overhead is negligible — it's the same parsing engine under the hood.

## Related

- [@scuton/retry-fn](https://github.com/scuton-technology/retry-fn) — Retry async functions with backoff
- [@scuton/ms-convert](https://github.com/scuton-technology/ms-convert) — Convert time strings to milliseconds

## License

MIT © [Scuton Technology](https://scuton.com)
