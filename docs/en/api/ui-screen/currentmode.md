---
type: reference
native: UIScreen.currentMode
---

# `UIScreen`: `currentMode` property

The **`currentMode`** property is the display mode this screen is using right now.

## Value

A [`UIScreenMode`](../ui-screen-mode.md) or `null`.

- Readable and writable.
- On the iPhone Air simulator (iOS 27.2) it reads a `UIScreenMode` whose [`size`](../ui-screen-mode/size.md) is the same as [`nativeBounds`](nativebounds.md).
- Writing it changes the resolution of an external display, with the value chosen from [`availableModes`](availablemodes.md). The phone's own screen has only one mode, so there is nothing to switch to. The effect of writing is **not verified in the simulator**.
- The [`modechange`](modechange-event.md) event fires when it changes.

### Invalid values

Writing a value that is not a native object throws `TypeError`:

```
TypeError: currentMode needs a native object or null, got "mode"
```

Writing another native object (a view, for example) also throws `TypeError`, with the message `currentMode needs a UIScreenMode or null`.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.currentMode !== null && screen.currentMode.size.width);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `1260`.

## Corresponding iOS API

`UIScreen.currentMode`.

## See also

- [`availableModes`](availablemodes.md)
- [`modechange`](modechange-event.md)
