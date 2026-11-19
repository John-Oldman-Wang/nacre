---
type: reference
native: "-[NSUserDefaults registerDefaults:]"
---

# `NSUserDefaults`: `registerDefaults()` method

The **`registerDefaults()`** method registers a set of default values: when a key has never been written, reading it gives the registered value.

## Syntax

```
registerDefaults(table)
```

### Parameters

**`table`**

A plain object. Property names are keys and property values are the defaults. Property values may be of the same types as for [`set()`](set.md).

### Return value

None (`undefined`).

A registered value takes effect only while the key has never been written. After writing with [`set()`](set.md), reading gives the written value; after deleting the written value with [`remove()`](remove.md), reading gives the registered default again.

Registered values are not written to disk, so register them once on every launch. For a key with a registered default, [`has()`](has.md) gives `true` even if it was never written.

### Exceptions

**`TypeError`**

- `table` is not a plain object: `registerDefaults: needs a plain object`.
- `table` contains a value that cannot be stored: the error is the same as for [`set()`](set.md#exceptions), starting with `registerDefaults`.

## Examples

```js
const storage = application.storage;
storage.registerDefaults({ theme: 'auto', pageSize: 20 });
console.log(storage.get('theme'));

storage.set('theme', 'dark');
console.log(storage.get('theme'));

storage.remove('theme');
console.log(storage.get('theme'));
```

**Result**: Prints `auto`, `dark`, and `auto` in turn.

## Corresponding iOS API

`-[NSUserDefaults registerDefaults:]`.

## See also

- [Registering defaults for settings](../../guides/save-settings.md#registering-defaults-for-settings)
