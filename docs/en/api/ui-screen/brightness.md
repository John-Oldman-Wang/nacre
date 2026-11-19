---
type: reference
native: UIScreen.brightness
---

# `UIScreen`: `brightness` property

The **`brightness`** property is the screen's brightness.

## Value

A number with no unit: `0` is darkest and `1` is brightest.

- Readable and writable.
- Reading gives the system's brightness at this moment. On the iPhone Air simulator (iOS 27.2) it reads `0.5`.
- Writing changes the screen brightness of the whole device. According to the iOS documentation, brightness set by the app lasts until the device locks. How the screen looks after writing is **not verified in the simulator**.
- When the user adjusts brightness in Control Center, the [`brightnesschange`](brightnesschange-event.md) event fires.

View controllers for scan-to-pay or showing a QR code often set the brightness to `1` and write the original value back when leaving.

### Invalid values

Writing a number outside `0` to `1` throws `TypeError`, and the brightness does not change:

```
TypeError: brightness must be between 0 and 1, got 1.5
```

Writing a value that cannot be converted to a number throws `TypeError`:

```
TypeError: brightness must be a finite number, got "bright"
```

Values that can be converted to numbers are converted by the [argument conversion](../native-classes.md) rules: `'0.5'` is treated as `0.5`.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.brightness);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs `0.5`.

## Corresponding iOS API

`UIScreen.brightness`. Writing a value outside 0 to 1 does not raise an error in ObjC; here it throws `TypeError`.

## See also

- [`UIScreen`](../ui-screen.md)
- [`wantsSoftwareDimming`](wantssoftwaredimming.md)
- [`brightnesschange`](brightnesschange-event.md)
