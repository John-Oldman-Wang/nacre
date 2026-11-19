---
type: reference
native: UIApplication.idleTimerDisabled
---

# `Application`: `idleTimerDisabled` property

The **`idleTimerDisabled`** property determines whether the device locks automatically after a period without touches.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The device doesn't lock automatically while the app is in the foreground. **Not verified in the simulator** |
| `false` | The device locks automatically according to the system settings |

- Readable and writable.
- Defaults to `false`.
- Writes take effect immediately, and the new value can be read right after writing. Non-boolean values are converted with `Boolean(v)`.
- Applies to the whole app and isn't restored automatically. Set it back to `false` when leaving the view controller that needs the screen on; otherwise the device never locks while the app is in the foreground, increasing power consumption.
- No event fires when it changes: only the app's own code can change it.

## Examples

```js
application.idleTimerDisabled = true;
console.log(application.idleTimerDisabled);
```

**Result**: the console prints `true`. Use it to keep the screen on while playing video or showing a QR code.

## Corresponding iOS API

`UIApplication.idleTimerDisabled`.

## See also

- [Handling the app lifecycle](../../guides/app-lifecycle.md#keep-the-screen-on)
