---
type: reference
native: "-[NSUserDefaults arrayForKey:]"
---

# `NSUserDefaults`: `arrayForKey()` method

The **`arrayForKey()`** method reads a key from storage and converts the value to an array. When it cannot be converted, it returns a fixed value instead of throwing.

## Syntax

```
arrayForKey(key)
```

### Parameters

**`key`**

The key name, a string.

### Return value

An array, or `null`.

- Returns `null` when the key does not exist (**not verified in the simulator**).
- Returns `null` when the stored value is not an array.
- The returned array is a copy; modifying it does not change the value in storage.

### Exceptions

**`TypeError`**

`key` is not a string: `arrayForKey: key must be a string`.

## Examples

```js
const storage = application.storage;
storage.set('recent', ['AAPL', 'TSLA']);
storage.set('name', 'Wang');
console.log(JSON.stringify(storage.arrayForKey('recent')), storage.arrayForKey('name'));
```

**Result**: Prints `["AAPL","TSLA"] null`.

## Corresponding iOS API

`-[NSUserDefaults arrayForKey:]`.

## See also

- [`get()`](get.md): reads the stored value as is, without type conversion
- [`has()`](has.md): checks whether the key exists
