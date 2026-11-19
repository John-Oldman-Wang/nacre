---
type: reference
native: UIScreen
status: partial
---

# `UIScreen`

**`UIScreen`** represents a screen: its size, pixel density, brightness, refresh rate, and whether it is being recorded right now.

Read the screen from a scene: [`scene.screen`](ui-window-scene/screen.md). An iPhone has only one screen, and every scene reads that one. With an external display connected, scenes shown on that display read a different screen. **External displays are not verified in the simulator.**

The screen's size is the extent of the whole screen, including the areas occupied by the status bar and the home indicator at the bottom. Lay out content using the view's safe area, not by calculating from the screen's size.

**Inheritance**: `EventTarget` → `NSObject` → `UIScreen`

## Constructor

It cannot be created with `new`. `new UIScreen()` throws `TypeError: Illegal constructor: UIScreen is created by the runtime, not by new`. Read the screen from a scene's [`screen`](ui-window-scene/screen.md).

## Instance properties

Also inherits the properties of `NSObject`.

Size and pixel density:

| Property | Description |
| --- | --- |
| [`bounds`](ui-screen/bounds.md) <small>read-only</small> | The extent of the whole screen, in pt |
| [`scale`](ui-screen/scale.md) <small>read-only</small> | How many pixels one pt corresponds to |
| [`nativeBounds`](ui-screen/nativebounds.md) <small>read-only</small> | The extent of the physical screen, in pixels |
| [`nativeScale`](ui-screen/nativescale.md) <small>read-only</small> | How many pixels one pt corresponds to on the physical screen |
| [`traitCollection`](ui-screen/traitcollection.md) <small>read-only</small> | The screen's traits |

Brightness:

| Property | Description |
| --- | --- |
| [`brightness`](ui-screen/brightness.md) | Screen brightness, `0` to `1` |
| [`wantsSoftwareDimming`](ui-screen/wantssoftwaredimming.md) | Whether to dim further in software below the hardware's minimum brightness |

Refresh and display:

| Property | Description |
| --- | --- |
| [`maximumFramesPerSecond`](ui-screen/maximumframespersecond.md) <small>read-only</small> | Maximum frames per second |
| [`calibratedLatency`](ui-screen/calibratedlatency.md) <small>read-only</small> | Display hardware latency, in seconds |
| [`currentEDRHeadroom`](ui-screen/currentedrheadroom.md) <small>read-only</small> | How many times brighter than normal white the brightest white can be right now |
| [`potentialEDRHeadroom`](ui-screen/potentialedrheadroom.md) <small>read-only</small> | How many times brighter than normal white the brightest white can be at most |
| [`referenceDisplayModeStatus`](ui-screen/referencedisplaymodestatus.md) <small>read-only</small> | The status of reference display mode |

Recording and mirroring:

| Property | Description |
| --- | --- |
| [`isCaptured`](ui-screen/iscaptured.md) <small>read-only</small> | Whether it is being recorded, cast, or mirrored right now |
| [`mirroredScreen`](ui-screen/mirroredscreen.md) <small>read-only</small> | Which screen this screen is mirroring |

Display modes (for external displays):

| Property | Description |
| --- | --- |
| [`availableModes`](ui-screen/availablemodes.md) <small>read-only</small> | All supported display modes |
| [`preferredMode`](ui-screen/preferredmode.md) <small>read-only</small> | The most suitable display mode |
| [`currentMode`](ui-screen/currentmode.md) | The display mode in use right now |

## Instance methods

| Method | Description |
| --- | --- |
| [`snapshotViewAfterScreenUpdates()`](ui-screen/snapshotviewafterscreenupdates.md) | Captures the screen's current contents as a view |

## Events

| Event | When it fires |
| --- | --- |
| [`brightnesschange`](ui-screen/brightnesschange-event.md) | The screen brightness changed |
| [`capturedchange`](ui-screen/capturedchange-event.md) | Recording, casting, or mirroring started or stopped |
| [`modechange`](ui-screen/modechange-event.md) | The display mode changed |
| [`referencedisplaymodestatuschange`](ui-screen/referencedisplaymodestatuschange-event.md) | The status of reference display mode changed |

- Events cannot be canceled. Callbacks do not run synchronously at the moment of the change but a little later; see [How the runtime works](how-it-works.md#events).
- You can also listen for and dispatch events with custom names on a screen.

## Examples

### Reading the screen size

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.bounds.width, screen.bounds.height, screen.scale);
  console.log(screen.nativeBounds.width, screen.nativeBounds.height);
});
```

**Result**: on the iPhone Air simulator (iOS 27.2), logs two lines:

```
420 912 3
1260 2736
```

### Maximum brightness while showing a QR code

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  const before = screen.brightness;
  screen.brightness = 1;
  // Write it back when leaving this view controller
  // screen.brightness = before;
  console.log(before);
});
```

**Effect**: the screen goes to maximum brightness, and the console logs the original brightness. According to the iOS documentation, brightness reverts to the system setting after the device locks. The screen brightening is **not verified in the simulator**.

An example that covers sensitive content during recording is in [`capturedchange`](ui-screen/capturedchange-event.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `UIScreen.mainScreen` | `scene.screen` |
| `view.window.windowScene.screen` | `view.window.windowScene.screen` |
| `screen.bounds.size.width` | `screen.bounds.width` |
| `screen.brightness = 1.0` | `screen.brightness = 1` |
| `screen.isCaptured` | `screen.isCaptured` |
| `UIScreenCapturedDidChangeNotification` | `screen.addEventListener('capturedchange', …)` |
| `UIScreenBrightnessDidChangeNotification` | `screen.addEventListener('brightnesschange', …)` |
| `UIScreenModeDidChangeNotification` | `screen.addEventListener('modechange', …)` |
| `UIScreenReferenceDisplayModeStatusDidChangeNotification` | `screen.addEventListener('referencedisplaymodestatuschange', …)` |

## See also

- [`UIWindowScene`](ui-window-scene.md): the screen is read from the scene
- [`UIScreenMode`](ui-screen-mode.md): display modes
- [Traits](ui-trait-collection.md): dark or light, screen scale
- [Units](units.md): pt and pixels
- [`UIDevice`](ui-device.md): device and system information
