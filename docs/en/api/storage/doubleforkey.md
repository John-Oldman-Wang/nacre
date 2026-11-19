---
type: reference
native: "-[NSUserDefaults doubleForKey:]"
---

# `NSUserDefaults`: `doubleForKey()` method

The **`doubleForKey()`** method reads a key from storage and converts the value to a number. When it cannot be converted, it returns a fixed value instead of throwing.

## Syntax

```
doubleForKey(key)
```

### Parameters

**`key`**

The key name, a string.

### Return value

A number.

- Returns `0` (**not verified in the simulator**), not `null`, when the key does not exist.
- Returns `42` when the stored value is the string `'42'`.

### Exceptions

**`TypeError`**

`key` is not a string: `doubleForKey: key must be a string`.

## Examples

```js
const storage = application.storage;
storage.set('ratio', '42');
console.log(storage.doubleForKey('ratio'));
```

**Result**: Prints `42`.

## Corresponding iOS API

`-[NSUserDefaults doubleForKey:]`.

## See also

- [`get()`](get.md): reads the stored value as is, without type conversion
- [`has()`](has.md): checks whether the key exists
