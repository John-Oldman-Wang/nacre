---
type: reference
native: "-[NSUserDefaults boolForKey:]"
---

# `NSUserDefaults`: `boolForKey()` method

The **`boolForKey()`** method reads a key from storage and converts the value to a boolean. When it cannot be converted, it returns a fixed value instead of throwing.

## Syntax

```
boolForKey(key)
```

### Parameters

**`key`**

The key name, a string.

### Return value

A boolean. Returns `false`, not `null`, when the key does not exist.

Only a few forms count as true. Results for various values (measured):

| Stored value | Result of `boolForKey()` |
| --- | --- |
| `true` | `true` |
| The string `'1'` | `true` |
| The string `'YES'` | `true` |
| The string `'42'` | `false` |
| No such key | `false` |

To judge the truthiness of a value, read it with [`get()`](get.md) and judge it yourself; do not use `boolForKey()`.

### Exceptions

**`TypeError`**

`key` is not a string: `boolForKey: key must be a string`.

## Examples

```js
const storage = application.storage;
storage.set('flag', 'YES');
storage.set('count', '42');
console.log(storage.boolForKey('flag'), storage.boolForKey('count'));
```

**Result**: Prints `true false`.

## Corresponding iOS API

`-[NSUserDefaults boolForKey:]`.

## See also

- [`get()`](get.md): reads the stored value as is, without type conversion
- [`has()`](has.md): checks whether the key exists
