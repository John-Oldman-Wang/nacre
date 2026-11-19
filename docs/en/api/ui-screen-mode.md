---
type: reference
native: UIScreenMode
---

# `UIScreenMode`

**`UIScreenMode`** represents one display mode of a screen: a resolution and a pixel shape.

The phone's own screen has only one display mode. An external display may support several; read them all from the screen's [`availableModes`](ui-screen/availablemodes.md), and write [`currentMode`](ui-screen/currentmode.md) to switch to another.

**Inheritance**: `EventTarget` → `NSObject` → `UIScreenMode`

## Constructor

It can't be created with `new`. `new UIScreenMode()` throws `TypeError: Illegal constructor: UIScreenMode is created by the runtime, not by new`. Read it from the screen's `availableModes`, `currentMode`, or `preferredMode`.

## Instance properties

| Property | Description |
| --- | --- |
| [`size`](ui-screen-mode/size.md) <small>read-only</small> | The size of this mode, in pixels |
| [`pixelAspectRatio`](ui-screen-mode/pixelaspectratio.md) <small>read-only</small> | The width-to-height ratio of one pixel |

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  for (const mode of e.scene.screen.availableModes) {
    console.log(mode.size.width, mode.size.height, mode.pixelAspectRatio);
  }
});
```

**Result**: In the iPhone Air simulator (iOS 27.2), prints one line: `1260 2736 1`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `screen.availableModes` | `screen.availableModes` |
| `mode.size` | `mode.size` |
| `mode.pixelAspectRatio` | `mode.pixelAspectRatio` |

## See also

- [`UIScreen`](ui-screen.md)
