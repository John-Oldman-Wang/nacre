---
type: reference
native: "-[NSUserDefaults objectForKey:]"
---

# `NSUserDefaults`: `get()` method

The **`get()`** method reads a key from storage and returns the stored value as is.

## Syntax

```
get(key)
```

### Parameters

**`key`**

The key name, a string.

### Return value

The stored value: a string, number, boolean, array, or plain object, with the same type it was stored with.

- Returns `null` when the key does not exist; does not throw.
- When the key was never written but a default was registered with [`registerDefaults()`](registerdefaults.md), returns the default.
- Returned arrays and objects are copies. Modifying them does not change the value in storage; call [`set()`](set.md) again to save.

### Exceptions

**`TypeError`**

`key` is not a string: `get: key must be a string`.

## Examples

```js
const storage = application.storage;
storage.set('n', '42');
console.log(storage.get('n'), storage.get('neverWritten'));
```

**Result**: Prints `42 null`. The first is the string `'42'`.

## Corresponding iOS API

`-[NSUserDefaults objectForKey:]`.

## See also

- [`set()`](set.md): writing
- [`has()`](has.md): only checks whether it exists
- [Typed reads](../storage.md#functions): the seven functions that convert types when reading
