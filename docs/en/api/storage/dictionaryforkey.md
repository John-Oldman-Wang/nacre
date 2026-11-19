---
type: reference
native: "-[NSUserDefaults dictionaryForKey:]"
---

# `NSUserDefaults`: `dictionaryForKey()` method

The **`dictionaryForKey()`** method reads a key from storage and converts the value to a plain object. When it cannot be converted, it returns a fixed value instead of throwing.

## Syntax

```
dictionaryForKey(key)
```

### Parameters

**`key`**

The key name, a string.

### Return value

A plain object, or `null`.

- Returns `null` when the key does not exist (**not verified in the simulator**).
- Returns `null` when the stored value is not an object (**not verified in the simulator**).
- The returned object is a copy. Modifying it does not save anything; [`set()`](set.md) the modified object again.

### Exceptions

**`TypeError`**

`key` is not a string: `dictionaryForKey: key must be a string`.

## Examples

```js
const storage = application.storage;
storage.set('profile', { name: 'Wang', level: 3, tags: ['vip'] });

const profile = storage.dictionaryForKey('profile');
if (profile) {
  console.log(profile.name, profile.level);
}
```

**Result**: Prints `Wang 3`.

## Corresponding iOS API

`-[NSUserDefaults dictionaryForKey:]`.

## See also

- [`get()`](get.md): reads the stored value as is, without type conversion
- [`has()`](has.md): checks whether the key exists
