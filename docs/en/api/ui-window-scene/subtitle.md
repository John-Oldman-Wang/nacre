---
type: reference
native: UIScene.subtitle
---

# `UIWindowScene`: `subtitle` property

The **`subtitle`** property is the subtitle shown on the card in the app switcher.

## Value

A string.

- Readable and writable.
- The default value is **not verified in the simulator**.
- Writing a value that isn't a string sets it to an empty string.
- How it looks on the card is **not verified in the simulator**.
- No event fires when it changes: only the App's own code changes it.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.subtitle = '3 unread';
  console.log(e.scene.subtitle);
});
```

**Result**: logs `3 unread`.

## Corresponding iOS API

`UIScene.subtitle`.

## See also

- [`title`](title.md)
