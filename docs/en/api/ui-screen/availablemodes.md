---
type: reference
native: UIScreen.availableModes
---

# `UIScreen`: `availableModes` property

The **`availableModes`** property is all the display modes this screen supports.

## Value

An array of [`UIScreenMode`](../ui-screen-mode.md).

- Read-only. Assigning to it throws `TypeError`.
- Contains at least one. On the iPhone Air simulator (iOS 27.2) there is `1`, which is [`currentMode`](currentmode.md).
- Only external displays may have several.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.availableModes.length);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `1`.

## Corresponding iOS API

`UIScreen.availableModes`.

## See also

- [`UIScreenMode`](../ui-screen-mode.md)
- [`currentMode`](currentmode.md)
