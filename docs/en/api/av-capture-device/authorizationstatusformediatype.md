---
type: reference
native: "+[AVCaptureDevice authorizationStatusForMediaType:]"
---

# `AVCaptureDevice.authorizationStatusForMediaType()` static method

The **`AVCaptureDevice.authorizationStatusForMediaType()`** static method returns the user's decision on whether this app may use the camera. Reading it never shows anything.

## Syntax

```
AVCaptureDevice.authorizationStatusForMediaType(mediaType)
```

### Parameters

**`mediaType`**

The media type. Only `'video'` (the camera) is accepted.

### Return value

A string, one of these four:

| Value | Meaning | Can the camera be used? |
| --- | --- | --- |
| `'notDetermined'` | The user hasn't been asked yet | No. Ask with [`requestAccessForMediaType()`](requestaccessformediatype.md) |
| `'authorized'` | The user agreed | Yes |
| `'denied'` | The user refused | No |
| `'restricted'` | A restriction on the device doesn't allow it (parental controls and the like); the user can't change it | No |

When the user changes it in the system Settings, this value changes with it. There is no event when it changes; read it again before using the camera. The value read after the user changes it in Settings is **not verified on a device**.

### Exceptions

**`TypeError`**

`mediaType` isn't `'video'`: `authorizationStatusForMediaType has no value "audio"; expected one of: video`.

## Examples

```js
const status = AVCaptureDevice.authorizationStatusForMediaType('video');
if (status === 'authorized') {
  console.log('Camera can be used');
} else if (status === 'notDetermined') {
  console.log('Not asked yet');
} else {
  console.log('Camera cannot be used');
}
```

**Effect**: prints one of the three lines. No alert is shown.

## Corresponding iOS API

`+[AVCaptureDevice authorizationStatusForMediaType:]`. `AVMediaTypeVideo` is written as `'video'`, `AVAuthorizationStatusAuthorized` as `'authorized'`, and so on.

## See also

- [`requestAccessForMediaType()`](requestaccessformediatype.md): ask the user
- [Authorization](../av-capture-device.md#authorization)
- [Ask for permission first](../../guides/scanning.md#ask-for-permission-first)
