---
type: reference
native: "-[NSUserDefaults removeObjectForKey:]"
---

# `NSUserDefaults`: `remove()` method

The **`remove()`** method deletes a key from storage.

## Syntax

```
remove(key)
```

### Parameters

**`key`**

The key name, a string.

### Return value

None (`undefined`).

After deletion, [`get()`](get.md) gives `null`, or the default if one was registered for this key. Deleting a key that does not exist does not throw.

### Exceptions

**`TypeError`**

`key` is not a string: `remove: key must be a string`.

## Examples

```js
const storage = application.storage;
storage.set('draft', 'Half-written content');
storage.remove('draft');
console.log(storage.get('draft'), storage.has('draft'));
```

**Result**: Prints `null false`.

`storage.set('draft', null)` has the same effect.

## Corresponding iOS API

`-[NSUserDefaults removeObjectForKey:]`.

## See also

- [`set()`](set.md): passing `null` also deletes
- [`registerDefaults()`](registerdefaults.md): reading gives the default after deletion
