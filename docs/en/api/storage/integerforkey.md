---
type: reference
native: "-[NSUserDefaults integerForKey:]"
---

# `NSUserDefaults`: `integerForKey()` method

The **`integerForKey()`** method reads a key from storage and converts the value to an integer. When it cannot be converted, it returns a fixed value instead of throwing.

## Syntax

```
integerForKey(key)
```

### Parameters

**`key`**

The key name, a string.

### Return value

A number that is an integer.

- Returns `0`, not `null`, when the key does not exist. To tell "no such key" from "the value is 0", use [`has()`](has.md) or [`get()`](get.md).
- Returns `42` when the stored value is the string `'42'`.
- What it returns when the stored value cannot be converted to a number is **not verified in the simulator**.

### Exceptions

**`TypeError`**

`key` is not a string: `integerForKey: key must be a string`.

## Examples

```js
const storage = application.storage;
storage.set('n', '42');
console.log(storage.get('n'), storage.integerForKey('n'));
console.log(storage.integerForKey('neverWritten'));
```

**Result**: First prints `42 42`; the first is the string `'42'` and the second is the number `42`. Then prints `0`.

## Corresponding iOS API

`-[NSUserDefaults integerForKey:]`.

## See also

- [`get()`](get.md): reads the stored value as is, without type conversion
- [`has()`](has.md): checks whether the key exists
