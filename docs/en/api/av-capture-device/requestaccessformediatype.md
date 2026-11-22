---
type: reference
native: "+[AVCaptureDevice requestAccessForMediaType:completionHandler:]"
---

# `AVCaptureDevice.requestAccessForMediaType()` static method

The **`AVCaptureDevice.requestAccessForMediaType()`** static method asks the user for permission to use the camera. The result is whether the user granted it.

## Syntax

```
AVCaptureDevice.requestAccessForMediaType(mediaType)
```

### Parameters

**`mediaType`**

The media type. Only `'video'` (the camera) is accepted.

### Return value

A `Promise` that fulfills with a boolean: `true` means the camera can be used, `false` means it can't.

- If the user hasn't been asked yet, the system shows an alert containing the `NSCameraUsageDescription` written in `nacre.config.json`. The promise fulfills after the user chooses. After asking, [`authorizationStatusForMediaType('video')`](authorizationstatusformediatype.md) reads `'authorized'` (verified by testing).
- If the user has already been asked, no alert is shown and the promise fulfills right away with the previous result (verified by testing). If the user refused before, it fulfills with `false`; only the user can change that, in the system Settings.
- The two cases where it fulfills with `false` (the user refused, or the device is restricted) are **not verified on a device**.

### Exceptions

Doesn't throw synchronously. When the argument is wrong, the promise rejects:

**`TypeError`**

`mediaType` isn't `'video'`: `requestAccessForMediaType has no value "audio"; expected one of: video`.

## Description

Asking first isn't required: if the user hasn't been asked yet, [`new AVCaptureDeviceInput(device)`](../av-capture-device-input/constructor.md) shows the same alert at that moment. Calling this method first lets you know the answer before connecting the camera, so you can show a different screen when the user refuses.

## Examples

```js
AVCaptureDevice.requestAccessForMediaType('video').then((granted) => {
  console.log(granted ? 'Camera can be used' : 'The user did not agree');
});
```

**Effect**: on the first run, the system alert appears, and a line is printed after the user taps. On later runs, no alert is shown and the previous result is printed right away.

## Corresponding iOS API

`+[AVCaptureDevice requestAccessForMediaType:completionHandler:]`. The `granted` argument of `completionHandler` is the value the promise fulfills with.

## See also

- [`authorizationStatusForMediaType()`](authorizationstatusformediatype.md): read the status only, without an alert
- [Authorization](../av-capture-device.md#authorization)
- [Ask for permission first](../../guides/scanning.md#ask-for-permission-first)
- [Installing `@nacrejs/av-capture`](../av-capture-session.md#installation): where `NSCameraUsageDescription` goes
