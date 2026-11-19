---
type: reference
native: "-[NSUserDefaults stringArrayForKey:]"
---

# `NSUserDefaults`: `stringArrayForKey()` method

The **`stringArrayForKey()`** method reads a key from storage and converts the value to an array of strings. When it cannot be converted, it returns a fixed value instead of throwing.

## Syntax

```
stringArrayForKey(key)
```

### Parameters

**`key`**

The key name, a string.

### Return value

An array of strings, or `null`.

- Returns `null` when the key does not exist (**not verified in the simulator**).
- Returns `null` when the array contains an element that is not a string.

### Exceptions

**`TypeError`**

`key` is not a string: `stringArrayForKey: key must be a string`.

## Examples

```js
const storage = application.storage;
storage.set('tags', ['vip', 'new']);
storage.set('mixed', ['vip', 3]);
console.log(JSON.stringify(storage.stringArrayForKey('tags')), storage.stringArrayForKey('mixed'));
```

**Result**: Prints `["vip","new"] null`.

## Corresponding iOS API

`-[NSUserDefaults stringArrayForKey:]`.

## See also

- [`get()`](get.md): reads the stored value as is, without type conversion
- [`has()`](has.md): checks whether the key exists
