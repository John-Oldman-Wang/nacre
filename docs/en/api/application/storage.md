---
type: reference
native: NSUserDefaults.standardUserDefaults
---

# `Application`: `storage` property

The **`storage`** property is the app's key-value storage, used for settings and small pieces of state.

## Value

`NSUserDefaults`. See [Local storage](../storage.md) for usage.

- Read-only. Assigning to it throws `TypeError`.
- Each read returns the same object.
- Writes are synchronous: when `set()` returns, the new value is already in effect, and the system takes care of writing it to disk. The value persists after the app is closed and reopened.

## Examples

```js
application.storage.set('theme', 'dark');
console.log(application.storage.get('theme'));
```

**Result**: the console prints `dark`.

## Corresponding iOS API

`NSUserDefaults.standardUserDefaults`.

## See also

- [Local storage](../storage.md)
- [`fileSystem`](filesystem.md), [`keychain`](keychain.md): the other two entry points for storing data
