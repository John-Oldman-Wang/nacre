---
type: reference
native: "+[PHPhotoLibrary authorizationStatusForAccessLevel:]"
---

# `PHPhotoLibrary.authorizationStatusForAccessLevel()` static method

The **`PHPhotoLibrary.authorizationStatusForAccessLevel()`** static method reads the current photo library authorization status. It only reads; it never shows a prompt.

## Syntax

```
PHPhotoLibrary.authorizationStatusForAccessLevel(accessLevel)
```

### Parameters

**`accessLevel`**

Only one value, `'addOnly'`: permission to add to the library.

### Return value

A string; see [Authorization status](../ph-photo-library.md#authorization-status): one of `'notDetermined'`, `'authorized'`, `'denied'`, `'restricted'`, `'limited'`. The `'addOnly'` level is never `'limited'`.

There is no event when the status changes. Read it once when you need it.

### Exceptions

**`TypeError`**

`accessLevel` is another value. When it is `'readWrite'`:

```
accessLevel "readWrite" is not supported: reading the photo library needs a different usage description; expected one of: addOnly. To let the user choose photos, use PHPickerViewController, which needs no permission
```

## Examples

```js
const saveButton = UIButton.buttonWithType('system');
const status = PHPhotoLibrary.authorizationStatusForAccessLevel('addOnly');
saveButton.isEnabled = status !== 'denied' && status !== 'restricted';
```

**Effect**: When the user has denied it or it is restricted by the system, the button is grayed out. Reading the status never shows a prompt.

## Corresponding iOS API

`+[PHPhotoLibrary authorizationStatusForAccessLevel:]`. `PHAccessLevelAddOnly` is written as `'addOnly'`; `PHAccessLevelReadWrite` isn't wired up.

## See also

- [`requestAuthorizationForAccessLevel()`](requestauthorizationforaccesslevel.md): requesting permission
- This class belongs to the `@nacrejs/photos` package; for how to install it, see [Install first](../photos.md#installation)
