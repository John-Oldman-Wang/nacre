---
type: reference
native: "-[NSUserDefaults objectForKey:]"
---

# `NSUserDefaults`: `has()` method

The **`has()`** method checks whether a value can be read for a key.

## Syntax

```
has(key)
```

### Parameters

**`key`**

The key name, a string.

### Return value

A boolean.

- `true`: a value can be read for this key, including keys never written whose default was only registered with [`registerDefaults()`](registerdefaults.md).
- `false`: never written and no default registered.

### Exceptions

**`TypeError`**

`key` is not a string: `has: key must be a string`.

## Examples

```js
const storage = application.storage;
storage.registerDefaults({ pageSize: 20 });
console.log(storage.has('pageSize'), storage.has('neverWritten'));
```

**Result**: Prints `true false`.

## Corresponding iOS API

There is no separate method. In ObjC you write `[d objectForKey:@"k"] != nil`.

## See also

- [`get()`](get.md)
- [`integerForKey()`](integerforkey.md): returns `0` when the key is absent; to tell "absent" from "is 0", use `has()` first
