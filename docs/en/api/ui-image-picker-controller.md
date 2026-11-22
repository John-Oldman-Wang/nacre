---
type: reference
native: UIImagePickerController
status: partial
---

# `UIImagePickerController`

**`UIImagePickerController`** represents the system's camera interface. It shows the camera viewfinder full screen, with buttons for the shutter, switching between the front and rear cameras, and the flash; after the user presses the shutter, it shows the photo taken, with "Retake" and "Use Photo" at the bottom. The system draws all of this; the app takes no part. When the user taps "Use Photo", the app gets the photo, as a [`UIImage`](ui-image.md).

`UIImagePickerController` is a [view controller](ui-view-controller.md), presented with the view controller method [`presentViewController()`](ui-view-controller/presentviewcontroller.md). When the user finishes taking a photo or cancels, it fires an event for each, and the app takes the photo and dismisses it in the listener.

This package does one thing: take a photo with the system interface. Picking images from the photo library is a different package, `@nacrejs/photos`.

> **Note:** Everything that happens after the camera interface is presented (what the interface looks like, the two events, the photo carried by the event) is currently **not verified in the simulator, and not yet verified on a device either**. The simulator has no camera and cannot take photos. The return values of the static methods, the defaults and reading/writing of the properties, and the errors for invalid values were verified in the acceptance tests in the simulator (iPhone Air, iOS 27.2).

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `UIImagePickerController`

For how to present the camera interface and get the photo, see the guide [Taking a photo](../guides/take-photo.md).

## Installation

Taking photos is not in the core; you need to install the `@nacrejs/camera` package first. Without it, there is no global `UIImagePickerController`, and type checking reports that the name cannot be found.

**1. Install the package.**

```bash
npm install @nacrejs/camera
```

**Effect**: The next time `ios/` is generated, the project embeds an extra `NacreCamera.framework`; projects that do not install it have no such framework in their output.

**2. Write a sentence for the user.** In `nacre.config.json`, write a sentence explaining why this app uses the camera. The key name `NSCameraUsageDescription` is defined by the system:

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": {
    "infoPlist": {
      "NSCameraUsageDescription": "Take a photo of the item you want to sell"
    }
  }
}
```

**Effect**: The first time the app opens the camera interface, the system shows an alert asking the user whether to allow camera access, and the alert shows this sentence. What the alert looks like on screen is **not verified in the simulator**. To write one per language, see [Configuring an app](../guides/project-config.md#writing-usage-descriptions).

If the package is installed but this sentence is missing, generating `ios/` reports an error and stops (verified by testing):

```
nacre: @nacrejs/camera needs NSCameraUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

**3. Bring in the types.** Add a line at the top of the entry file:

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/camera" />
```

**Effect**: `UIImagePickerController` gets completion and checking in the editor.

## Constructor

[`UIImagePickerController()`](ui-image-picker-controller/constructor.md)

Creates a camera interface. After creating it, first write `sourceType` as `'camera'`.

## Static methods

All three query this device's hardware. You can call them at any time without creating an object first.

[`UIImagePickerController.isSourceTypeAvailable()`](ui-image-picker-controller/issourcetypeavailable.md)

Whether a source is available on this device. `'camera'` being available does not mean there is a camera.

[`UIImagePickerController.isCameraDeviceAvailable()`](ui-image-picker-controller/iscameradeviceavailable.md)

Whether there is a camera on the back or on the screen side.

[`UIImagePickerController.isFlashAvailableForCameraDevice()`](ui-image-picker-controller/isflashavailableforcameradevice.md)

Whether a camera has a flash.

## Instance properties

Also inherits the properties of [`UIViewController`](ui-view-controller.md), such as `title` and `modalPresentationStyle`. It has no navigation stack members (`pushViewController()`, `viewControllers`, and so on).

| Property | Description |
| --- | --- |
| [`sourceType`](ui-image-picker-controller/sourcetype.md) | Where the image comes from. Can only be written as `'camera'` |
| [`allowsEditing`](ui-image-picker-controller/allowsediting.md) | Lets the user crop after taking the photo |
| [`cameraDevice`](ui-image-picker-controller/cameradevice.md) | Which camera to use when it opens |
| [`cameraFlashMode`](ui-image-picker-controller/cameraflashmode.md) | The flash |

Set these properties before presenting. Whether changing them after the interface is on screen has any effect is **not verified**. They fire no events when they change; whether the properties follow along after the user switches cameras or the flash in the camera interface is **not verified**.

## Instance methods

It has no methods of its own. Present and dismiss with methods inherited from [`UIViewController`](ui-view-controller.md):

| What you want to do | How |
| --- | --- |
| Present it | [`page.presentViewController(picker, { animated: true })`](ui-view-controller/presentviewcontroller.md) |
| Dismiss it | [`picker.dismissViewController({ animated: true })`](ui-view-controller/dismissviewcontroller.md) |

Both methods return a Promise that completes when the animation ends.

## Events

Listen with `addEventListener()`.

| Event | When it fires |
| --- | --- |
| [`pick`](ui-image-picker-controller/pick-event.md) | The user took a photo and tapped "Use Photo". The event carries the photo |
| [`cancel`](ui-image-picker-controller/cancel-event.md) | The user tapped "Cancel" |
| `beforeappear`, `appear`, `beforedisappear`, `disappear` | Inherited from `UIViewController`; see [Appearing and disappearing](ui-view-controller.md#appearing-and-disappearing) |
| `traitchange` | Inherited from `UIViewController`; see [Appearance traits](ui-trait-collection.md) |

- Each presentation receives only one of `pick` and `cancel`.
- Listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.
- The view controller events `beforedismiss`, `dismiss`, and `dismissattempt` and the navigation events `beforeshow` and `show` do not fire on the camera interface. Listening for them does not throw either; they are treated as custom events.

## Sources

`sourceType` is where the camera interface's images come from. The system defines three values:

| Value | Meaning | Can it be written |
| --- | --- | --- |
| `'camera'` | The camera | Yes. Throws `TypeError` when this source is unavailable on the device |
| `'photoLibrary'`, `'savedPhotosAlbum'` | The photo library, in two listings | No; throws `TypeError` |

A new `UIImagePickerController` reads `'photoLibrary'`, which is the system default. So **after creating it you must write `sourceType` as `'camera'`** for it to be a camera interface. If you present it without doing so, what appears is not the camera but the system's photo picking interface (**not verified**). To pick images from the photo library, use `@nacrejs/photos`.

`cameraDevice` and `cameraFlashMode` only make sense for the camera, so they can only be read and written when `sourceType` is `'camera'`.

## The app dismisses the camera interface

**The system does not dismiss the camera interface by itself.** After the user taps "Use Photo" or "Cancel", the interface stays on screen until the app dismisses it:

| What the user did | Event fired | What the app should do |
| --- | --- | --- |
| Took a photo and tapped "Use Photo" | `pick`, with the photo | Take the photo, call `dismissViewController()` |
| Tapped "Cancel" | `cancel` | Call `dismissViewController()` |

Listen for both events. If you only listen for `pick`, the interface cannot be closed after the user taps "Cancel".

## Examples

### Take a photo with a button tap

The following code starts from a blank app. The page has a button and an image view. Tapping the button presents the camera interface, and after the photo is taken it is shown in the image view.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/camera" />

application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('Take Photo', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  const preview = new UIImageView();
  preview.frame = new CGRect(40, 180, 240, 320);
  preview.contentMode = 'scaleAspectFit';
  page.view.addSubview(preview);

  button.addEventListener('click', () => {
    // 1. First ask whether photos can be taken: the source is available and there is at least one camera
    const hasCamera =
      UIImagePickerController.isCameraDeviceAvailable('rear') ||
      UIImagePickerController.isCameraDeviceAvailable('front');
    if (!UIImagePickerController.isSourceTypeAvailable('camera') || !hasCamera) {
      console.log('This device cannot take photos');
      return;
    }

    // 2. Create the camera interface and set the source to the camera
    const picker = new UIImagePickerController();
    picker.sourceType = 'camera';

    // 3. The user tapped "Use Photo": take the photo and dismiss the interface
    picker.addEventListener('pick', (event) => {
      const { originalImage } = event;
      preview.image = originalImage;
      console.log('Took ' + originalImage.size.width + ' × ' + originalImage.size.height);
      picker.dismissViewController({ animated: true });
    });

    // 4. The user tapped "Cancel": dismiss the interface
    picker.addEventListener('cancel', () => {
      console.log('No photo taken');
      picker.dismissViewController({ animated: true });
    });

    // 5. Present it from the current view controller
    page.presentViewController(picker, { animated: true });
  });
});
```

**Effect**

- Near the top left of the page is a button with blue text, "Take Photo".
- In the simulator, tapping it prints `This device cannot take photos`, and the interface does not change.
- On a device, tapping it (the following is **not verified**): the first time, the system's permission alert appears first; after the user allows it, the camera interface rises from the bottom and covers the whole screen.
- Pressing the shutter and tapping "Use Photo" lowers the camera interface; the photo is shown, scaled to fit, in the 240 × 320 pt area below the button, and the console prints the photo's width and height.
- Tapping "Cancel" lowers the camera interface, and the console prints `No photo taken`.

This code has not been run as a whole.

For more patterns, see the guide [Taking a photo](../guides/take-photo.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIImagePickerController isSourceTypeAvailable:UIImagePickerControllerSourceTypeCamera]` | `UIImagePickerController.isSourceTypeAvailable('camera')` |
| `[UIImagePickerController isCameraDeviceAvailable:UIImagePickerControllerCameraDeviceFront]` | `UIImagePickerController.isCameraDeviceAvailable('front')` |
| `[UIImagePickerController isFlashAvailableForCameraDevice:UIImagePickerControllerCameraDeviceRear]` | `UIImagePickerController.isFlashAvailableForCameraDevice('rear')` |
| `[[UIImagePickerController alloc] init]` | `new UIImagePickerController()` |
| `picker.sourceType = UIImagePickerControllerSourceTypeCamera` | `picker.sourceType = 'camera'` |
| `picker.allowsEditing = YES` | `picker.allowsEditing = true` |
| `picker.cameraDevice = UIImagePickerControllerCameraDeviceFront` | `picker.cameraDevice = 'front'` |
| `picker.cameraFlashMode = UIImagePickerControllerCameraFlashModeOff` | `picker.cameraFlashMode = 'off'` |
| `picker.delegate = self` and implement<br>`imagePickerController:didFinishPickingMediaWithInfo:` | `picker.addEventListener('pick', (e) => { … })` |
| `info[UIImagePickerControllerOriginalImage]`<br>`info[UIImagePickerControllerEditedImage]`<br>`info[UIImagePickerControllerCropRect]` | `e.originalImage`<br>`e.editedImage`<br>`e.cropRect` |
| Implement `imagePickerControllerDidCancel:` | `picker.addEventListener('cancel', () => { … })` |
| `[self presentViewController:picker animated:YES completion:nil]` | `page.presentViewController(picker, { animated: true })` |
| `[picker dismissViewControllerAnimated:YES completion:nil]` | `picker.dismissViewController({ animated: true })` |

There are two differences from ObjC:

- In ObjC, writing `sourceType` when the source is unavailable throws an exception and the app terminates (according to Apple's documentation, **not verified**). Here it is a `TypeError` you can `catch`.
- In ObjC, `UIImagePickerController` inherits from `UINavigationController`. Here it inherits from `UIViewController`, and `picker instanceof UINavigationController` is `false`.

## See also

- [Taking a photo](../guides/take-photo.md): checking the device, presenting, dismissing, cropping, wrapping in a Promise
- [`UIViewController`](ui-view-controller.md): the camera interface's superclass. Presenting, dismissing, who presented whom
- [`UIImage`](ui-image.md): the type of the photo. How to display it and get a thumbnail
- [Configuring the app: name, languages, usage descriptions](../guides/project-config.md): how to write usage descriptions, including per language
- [Core and capability packages](capabilities.md): which capabilities must be installed separately
- [`UIActivityViewController`](ui-activity-view-controller.md): hand the photo to the system share sheet
- [Structs](structs.md): `CGRect`, the type of `cropRect`
