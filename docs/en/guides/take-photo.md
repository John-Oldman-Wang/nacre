# Taking a photo

This guide covers how to use [`UIImagePickerController`](../api/ui-image-picker-controller.md) to present the system camera interface and get the photo the user takes. The photo's type is [`UIImage`](../api/ui-image.md).

Before you start, install `@nacrejs/camera` and write `NSCameraUsageDescription` in `nacre.config.json`; see [`UIImagePickerController`](../api/ui-image-picker-controller.md#installation).

## Recommended approach

- **Before presenting, ask whether this device can take photos.** Ask two things: whether the camera source is available, and whether there is a camera. For how, see [First ask whether this device can take photos](#first-ask-whether-this-device-can-take-photos).
- **Listen for both `pick` and `cancel`, and call `dismissViewController()` in both listeners.** The system doesn't close the camera interface by itself.
- **Create a new `UIImagePickerController` for each photo.** You don't need to keep it after closing it; it is reclaimed when no variable refers to it.
- **The photo is much larger than the screen.** It is the camera's full resolution (the exact size is **not verified**; the first example prints it to the console). When you only need to show a small image in the interface (an avatar, a thumbnail), use [`prepareThumbnail()`](../api/ui-image.md#large-images-and-network-images) to get a scaled-down one to display, instead of handing the original directly to a small image view.
- **If you want a single `await`, wrap it in your own function.** For how, see [Wrapping it in a function that returns a Promise](#wrapping-it-in-a-function-that-returns-a-promise).

## First example

Starting from a blank app, the view controller has a button and an image view. Tapping the button presents the camera interface, and after the photo is taken it is shown in the image view.

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

    // 2. Create the camera interface with the camera as its source
    const picker = new UIImagePickerController();
    picker.sourceType = 'camera';

    // 3. The user tapped "Use Photo": take the photo and close the interface
    picker.addEventListener('pick', (event) => {
      const { originalImage } = event;
      preview.image = originalImage;
      console.log('Took a photo of ' + originalImage.size.width + ' × ' + originalImage.size.height);
      picker.dismissViewController({ animated: true });
    });

    // 4. The user tapped "Cancel": close the interface
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

- A button with blue text, "Take Photo", appears at the top left of the view.
- In the simulator, tapping it prints `This device cannot take photos` to the console, and the interface doesn't change.
- On a device, tapping it (the following is **not verified**): the first time, the system's permission prompt appears first; after the user agrees, the camera interface slides up from the bottom and covers the whole screen.
- Pressing the shutter and tapping "Use Photo" slides the camera interface down, the photo is shown proportionally in the 240 × 320 pt area below the button, and the console prints the photo's width and height.
- Tapping "Cancel" slides the camera interface down, and the console prints `No photo taken`.

This code hasn't been run as a whole.

The five steps are: ask about the device, create the camera interface and set its source, listen for `pick`, listen for `cancel`, and present it.

## First ask whether this device can take photos

Not every device can take photos. Before presenting, ask two things, and present only if both hold:

```js
function canTakePhoto() {
  // 1. Whether the camera source is available
  if (!UIImagePickerController.isSourceTypeAvailable('camera')) return false;
  // 2. Whether there is at least one camera
  return UIImagePickerController.isCameraDeviceAvailable('rear') ||
         UIImagePickerController.isCameraDeviceAvailable('front');
}

console.log(canTakePhoto());
```

**Effect**: In the simulator the console prints `false`. The output on a device with a camera is **not verified**.

Ask the two separately, because their answers can differ. Measured in the simulator (iPhone Air, iOS 27.2):

| What is asked | Answer in the simulator |
| --- | --- |
| `UIImagePickerController.isSourceTypeAvailable('camera')` | `true` |
| `UIImagePickerController.isCameraDeviceAvailable('rear')` | `false` |
| `UIImagePickerController.isCameraDeviceAvailable('front')` | `false` |
| `UIImagePickerController.isFlashAvailableForCameraDevice('rear')`, `('front')` | `false` |

- **Asking only the first isn't enough.** In the simulator the first is `true` and `sourceType` can be set to `'camera'`, but there is no camera. What you see if you present the camera interface then, and whether it errors, is **not verified in the simulator**.
- When the first is `false`, setting `sourceType` to `'camera'` throws `TypeError` (see [`sourceType`](../api/ui-image-picker-controller/sourcetype.md)).
- When `canTakePhoto()` is `false`, don't show the "Take Photo" entry point, or gray it out.

The examples below reuse `canTakePhoto()` from here and the variables below. All properties are set before presenting.

```js
const page = new UIViewController();
const button = UIButton.buttonWithType('system');
const picker = new UIImagePickerController();
if (canTakePhoto()) picker.sourceType = 'camera';
```

**Effect**: Creates a view controller, a button, and a camera interface. On devices that can take photos, the camera interface's source is the camera.

## When the camera interface closes

The system doesn't close the camera interface by itself. After the user taps "Use Photo" or "Cancel", the interface stays on screen until the app closes it:

| What the user did | Event fired | What the app should do |
| --- | --- | --- |
| Took a photo and tapped "Use Photo" | [`pick`](../api/ui-image-picker-controller/pick-event.md), carrying the photo | Take the photo and call `dismissViewController()` |
| Tapped "Cancel" | [`cancel`](../api/ui-image-picker-controller/cancel-event.md) | Call `dismissViewController()` |

- **Listen for both events.** If you listen only for `pick`, the interface can't be closed after the user taps "Cancel".
- Each presentation receives only one of them.
- Whether events fire while the user goes back and forth between "Retake" and the viewfinder is **not verified**; according to the system headers, events come only when the user confirms or cancels.
- The view controller's `beforedismiss`, `dismiss`, and `dismissattempt` don't fire on the camera interface; listening for them doesn't throw, they just never arrive. These three events are about the user dragging a view controller down to dismiss it; the camera interface is full screen, and whether it can be dragged away is **not verified**.

## When the user doesn't allow the camera

The system shows a permission prompt the first time the app opens the camera interface. The app can't read from this class what the user chose. What the camera interface looks like after the user declines, and whether it asks again later, are both **not verified**.

## Letting the user crop after taking a photo

```js
picker.allowsEditing = true;

picker.addEventListener('pick', (shot) => {
  // With cropping on, use the cropped image; if there isn't one, fall back to the original
  const image = shot.editedImage ?? shot.originalImage;
  console.log(image.size.width + ' × ' + image.size.height);
  picker.dismissViewController({ animated: true });
});
```

**Effect** (**not verified**): After the user presses the shutter there is an extra step where they can move and zoom the photo to choose an area; after "Use Photo", `editedImage` is the cropped area, `originalImage` is still the whole original, and `cropRect` is the area's position in the original.

## Opening with the front camera

```js
if (UIImagePickerController.isCameraDeviceAvailable('front')) {
  picker.cameraDevice = 'front';
}
```

**Effect** (**not verified**): When the camera interface opens, it shows the view from the camera on the screen side. The user can still switch to the rear camera in the interface.

[`cameraDevice`](../api/ui-image-picker-controller/cameradevice.md) can be read and written only after `sourceType` is set to `'camera'`; in the reverse order it throws `TypeError`.

## Keeping the flash from firing

```js
if (picker.sourceType === 'camera') {
  picker.cameraFlashMode = 'off';
}
```

**Effect** (**not verified**): When the camera interface opens, the flash is off. The user can still turn it on in the interface.

## Graying out the entry point when photos can't be taken

```js
button.isEnabled = canTakePhoto();
```

**Effect**: In the simulator the button is gray and can't be tapped. On devices that can take photos, the button is normal (**not verified**).

## Wrapping it in a function that returns a Promise

```js
/**
 * @param {UIViewController} from The view controller to present from
 * @returns {Promise<UIImage | null>} The photo taken; null when photos can't be taken or the user cancels
 */
function takePhoto(from) {
  return new Promise((resolve) => {
    if (!canTakePhoto()) {
      resolve(null);
      return;
    }
    const camera = new UIImagePickerController();
    camera.sourceType = 'camera';
    /** @param {UIImage | null} image */
    const finish = (image) => {
      camera.dismissViewController({ animated: true });
      resolve(image);
    };
    camera.addEventListener('pick', (event) => {
      finish(event.originalImage);
    });
    camera.addEventListener('cancel', () => finish(null));
    from.presentViewController(camera, { animated: true });
  });
}

takePhoto(page).then((photo) => {
  console.log(photo === null ? 'No photo' : 'Got a photo');
});
```

**Effect**: In the simulator the console prints `No photo`. On a device (**not verified**), the camera interface is presented; after the user takes a photo it prints `Got a photo`, and on cancel it prints `No photo`.

## Sharing the photo you took

```js
picker.addEventListener('pick', async (event) => {
  const { originalImage } = event;
  // Wait for the camera interface to finish closing before presenting the next view controller
  await picker.dismissViewController({ animated: true });
  page.presentViewController(new UIActivityViewController([originalImage]), { animated: true });
});
```

**Effect** (**not verified**): After the camera interface closes, the system [share sheet](../api/ui-activity-view-controller.md) slides up with the photo just taken, which can be saved to Photos or sent to someone.

A view controller can present only one view controller at a time, so wait for the previous one to finish closing.

## See also

- [`UIImagePickerController`](../api/ui-image-picker-controller.md): all properties and events
- [`UIImage`](../api/ui-image.md): how to display photos and get thumbnails
- [`UIViewController`](../api/ui-view-controller.md): presenting and dismissing
- [`UIActivityViewController`](../api/ui-activity-view-controller.md): the share sheet
- [Configuring the app](project-config.md#writing-usage-descriptions): how to write usage descriptions, including per language
