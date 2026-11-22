---
type: reference
native: "+[AVCaptureDevice defaultDeviceWithDeviceType:mediaType:position:]"
---

# `AVCaptureDevice.defaultDeviceWithDeviceType()` static method

The **`AVCaptureDevice.defaultDeviceWithDeviceType()`** static method finds a camera by its type and by which side of the device it's on.

## Syntax

```
AVCaptureDevice.defaultDeviceWithDeviceType(deviceType)
AVCaptureDevice.defaultDeviceWithDeviceType(deviceType, { mediaType, position })
```

### Parameters

**`deviceType`**

The type of camera, one of these strings:

| Value | What it is |
| --- | --- |
| `'builtInWideAngleCamera'` | The wide-angle camera. Every iPhone has one |
| `'builtInUltraWideCamera'` | The ultra-wide camera |
| `'builtInTelephotoCamera'` | The telephoto camera |
| `'builtInDualCamera'`, `'builtInDualWideCamera'`, `'builtInTripleCamera'` | One camera made of several lenses, switching lenses automatically by zoom factor |
| `'builtInTrueDepthCamera'`, `'builtInLiDARDepthCamera'` | Cameras with depth information |
| `'builtInOuterUltraWideCamera'`, `'builtInInnerUltraWideCamera'` | Only available from iOS 27.1. On earlier systems, writing them throws `TypeError` |
| `'continuityCamera'`, `'external'` | External cameras |

**`options.mediaType`**

Only `'video'`, or omitted. Omitting it or passing `null` means any media type.

**`options.position`**

Which side of the device: `'back'`, `'front'` (the screen side), or `'unspecified'` (either side). Defaults to `'unspecified'`.

### Return value

The `AVCaptureDevice` found, or `null` when this device doesn't have one.

- `'builtInWideAngleCamera'` with `{ mediaType: 'video', position: 'front' }` finds the front camera, which is a different object from the one [`defaultDeviceWithMediaType('video')`](defaultdevicewithmediatype.md) returns (verified by testing).
- Passing only the type also finds a camera (verified by testing).
- Which types are found and which are `null` on each model is **not verified on a device**.

### Exceptions

**`TypeError`**

- `deviceType` isn't a value in the table: `defaultDeviceWithDeviceType has no value "wide"; expected one of: …`, followed by all types.
- `options.position` is wrong: `defaultDeviceWithDeviceType position has no value "up"; expected one of: …`.
- `options.mediaType` isn't `'video'`: `defaultDeviceWithDeviceType mediaType has no value "audio"; expected one of: video`.

## Examples

```js
const front = AVCaptureDevice.defaultDeviceWithDeviceType('builtInWideAngleCamera', {
  mediaType: 'video',
  position: 'front',
});
console.log(front === null ? 'No front camera' : front.position);
```

**Effect**: prints `front` on an iPhone.

## Corresponding iOS API

`+[AVCaptureDevice defaultDeviceWithDeviceType:mediaType:position:]`. The last two parts go in an options object, and both can be omitted; `mediaType:nil` means omitting `mediaType`. `AVCaptureDeviceTypeBuiltInWideAngleCamera` is written as `'builtInWideAngleCamera'`, `AVCaptureDevicePositionFront` as `'front'`, and so on.

## See also

- [`defaultDeviceWithMediaType()`](defaultdevicewithmediatype.md): the default camera
- [`position`](position.md): which side a camera is on
