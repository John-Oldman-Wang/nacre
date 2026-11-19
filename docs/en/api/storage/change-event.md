---
type: reference
native: NSUserDefaultsDidChangeNotification
---

# `NSUserDefaults`: `change` event

The **`change`** event fires after any key in the storage is written or deleted.

## Syntax

```
application.storage.addEventListener('change', (event) => { })
```

## Event object

`Event`. It has only `type` and `target`, with no key name or value. Not cancelable.

## When it fires

- **The event does not say which key changed.** Re-read the keys you care about in the callback.
- **The app's own writes trigger it.** After code calls [`set()`](set.md) or [`remove()`](remove.md), callbacks it registered itself receive the event.
- **The system's writes trigger it too.** iOS itself also writes to this storage, and those writes fire `change` as well. So the callback being called does not mean a key the app cares about changed.
- **It fires once per write, without merging.** Writing three keys in a row gives three events.
- The event does not fire before `set()` returns, but after the current piece of code finishes running. The line after `set()` does not receive it yet.
- Changes to this storage from outside the app's process do not fire `change` (from the iOS definition; **not verified in the simulator**).

## Examples

```js
const storage = application.storage;
const onChange = () => {
  console.log('Storage changed, current theme:', storage.get('theme'));
};
storage.addEventListener('change', onChange);

storage.set('theme', 'light');
console.log('set returned');
```

**Result**: Prints `set returned` first, then `Storage changed, current theme: light`. The callback runs only after the current piece of code finishes.

When it is no longer needed, remove it with `storage.removeEventListener('change', onChange)`; later writes no longer call this callback.

## Corresponding iOS API

`NSUserDefaultsDidChangeNotification`.

## See also

- [Updating the UI when storage changes](../../guides/save-settings.md#updating-the-ui-when-storage-changes): comparing old and new values in the callback
