---
type: reference
native: "-[NSUserDefaults stringForKey:]"
---

# `NSUserDefaults`: `stringForKey()` method

The **`stringForKey()`** method reads a key from storage and converts the value to a string. When it cannot be converted, it returns a fixed value instead of throwing.

## Syntax

```
stringForKey(key)
```

### Parameters

**`key`**

The key name, a string.

### Return value

A string, or `null`.

- Returns `null` when the key does not exist.
- What it returns when the stored value is not a string is **not verified in the simulator**.

### Exceptions

**`TypeError`**

`key` is not a string: `stringForKey: key must be a string`.

## Examples

```js
const storage = application.storage;
storage.set('name', 'Wang');
console.log(storage.stringForKey('name'), storage.stringForKey('neverWritten'));
```

**Result**: Prints `Wang null`.

## Corresponding iOS API

`-[NSUserDefaults stringForKey:]`.

## See also

- [`get()`](get.md): reads the stored value as is, without type conversion
- [`has()`](has.md): checks whether the key exists
