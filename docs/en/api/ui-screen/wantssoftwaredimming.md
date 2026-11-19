---
type: reference
native: UIScreen.wantsSoftwareDimming
---

# `UIScreen`: `wantsSoftwareDimming` property

The **`wantsSoftwareDimming`** property determines whether the picture is dimmed further in software when brightness is below the lowest value the hardware can reach.

## Value

A boolean.

- Readable and writable. Defaults to `false`.
- `true`: when [`brightness`](brightness.md) is set below the hardware's minimum, the system dims the picture further. According to the iOS documentation, this costs a little performance. **Not verified in the simulator.**
- `false`: brightness goes no lower than the hardware's minimum.
- No change notification: only the app itself changes it.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.wantsSoftwareDimming);
});
```

**Result**: logs `false`.

## Corresponding iOS API

`UIScreen.wantsSoftwareDimming`.

## See also

- [`brightness`](brightness.md)
