---
type: reference
native: UIScene.title
---

# `UIWindowScene`: `title` property

The **`title`** property is the title shown on the card in the app switcher. The app switcher is what the user sees after swiping up from the bottom of the screen; each App appears as a card.

## Value

A string, or `null`.

- Readable and writable.
- The default value is **not verified in the simulator**.
- Writing `null` clears it.
- How it looks on the card is **not verified in the simulator**.
- No event fires when it changes: only the App's own code changes it.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.title = 'Inbox';
  console.log(e.scene.title);
});
```

**Result**: logs `Inbox`.

## Corresponding iOS API

`UIScene.title`.

## See also

- [`subtitle`](subtitle.md)
