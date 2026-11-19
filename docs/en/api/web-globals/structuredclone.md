---
type: reference
web: structuredClone()
---

# `structuredClone()` global function

The **`structuredClone()`** global function deep-copies a value: objects, arrays, `Map`, `Set`, `Date`, binary data, all copied level by level.

## Syntax

```
structuredClone(value[, options])
```

### Parameters

**`value`**

The value to copy.

**`options`**

Optional, an object. `null` and `undefined` are treated as not given.

**`options.transfer`**

Optional. Can only be omitted or given as an empty array. Transferring an `ArrayBuffer` to the copy isn't supported yet; see Exceptions below.

### Return value

The copied value. Primitive values are returned as is.

The types that can be copied, and what they look like after copying:

| Type | After copying |
| --- | --- |
| Numbers, strings, booleans, `null`, `undefined`, `BigInt` | The same value |
| Plain objects | A new object. Only its own, enumerable, string-keyed properties are included. Getters are read once, and the copy holds the value read |
| Arrays | A new array. Same length; holes stay holes |
| `Date` | A new `Date` with the same time |
| `RegExp` | A new `RegExp` with the same pattern and flags; `lastIndex` is 0 |
| `Map`, `Set` | A new `Map` or `Set`; keys and values are also copied, in the same order |
| `ArrayBuffer` | A new `ArrayBuffer` with the bytes copied |
| Typed arrays, `DataView` | The same type. The whole underlying `ArrayBuffer` is copied; the offset and length stay the same |
| `Error`, `RangeError`, `TypeError`, and so on | The same type, with `message`, `cause`, and `stack`. If `name` was changed to something else, it becomes `Error` after copying. Fields you added yourself aren't included |
| Instances of your own classes | Plain objects; the fields are there, but the methods and prototype are gone |

When the same object appears more than once in `value`, it is also the same object in the copy. Circular references are copied as usual.

### Exceptions

**`Error`**, with `name` set to `DataCloneError`

- `value` contains something that can't be copied; see [Values that can't be deep-copied](../web-globals.md#values-that-cant-be-deep-copied). `message` says which one, for example `#<UIView> could not be cloned.` or `Symbol(id) could not be cloned.`. If anything anywhere can't be copied, the whole call throws; it never returns a half-copied result.
- `options.transfer` is a non-empty array: `structuredClone: options.transfer is not supported yet; leave it out and the ArrayBuffer is copied instead`

**`TypeError`**

- `options` isn't an object: `structuredClone: the options must be an object`
- `options.transfer` isn't an array: `structuredClone: options.transfer must be an array`
- No argument: `structuredClone: 1 argument required, but only 0 present`

**Exceptions thrown by getters**

When a getter throws while a property of `value` is being read, that exception is thrown as is, not converted to `DataCloneError`.

## Description

`JSON.parse(JSON.stringify(value))` throws on circular references and turns `Date` into a string; `structuredClone()` doesn't.

## Examples

```js
const settings = { theme: 'dark', recent: [1, 2, 3], savedAt: new Date() };
const copy = structuredClone(settings);
copy.recent.push(4);
console.log(settings.recent.length, copy.recent.length, copy.savedAt instanceof Date);
```

**Result**: Prints `3 4 true`. The array in the copy is a different array, and the `Date` is still a `Date`. **Not verified in the simulator.**

## Differences from the web

| Situation | Browser | Here |
| --- | --- | --- |
| The object thrown on error | `DOMException` | `Error`, with the same `name` (`DataCloneError`). Code that checks `err.name` works as usual; code that checks `instanceof DOMException` doesn't |
| `structuredClone(value, { transfer: [buffer] })` | Transfers `buffer` to the copy; the original can't be used anymore | Throws `DataCloneError`. Without `transfer`, `buffer` is copied |
| `structuredClone(new SharedArrayBuffer(8))` | The copy and the original share the same memory | Throws `DataCloneError` |
| `structuredClone(new Blob(['x']))` | Works | Throws `DataCloneError` |

## See also

- [Values that can't be deep-copied](../web-globals.md#values-that-cant-be-deep-copied)
- [Deep-copying an object](../../guides/text-and-bytes.md#the-original-is-unaffected-after-a-deep-copy): more examples
