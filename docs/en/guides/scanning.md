# Scanning codes

This guide covers scanning codes with the camera in real time: asking for permission, showing the camera feed on a page, recognizing a QR code, recognizing only the codes inside a scan frame, drawing a box around the codes it recognizes, letting the user choose when one frame has several codes, stopping after a scan, and the flashlight, focus, and zoom. The last section covers recognizing codes in an existing image.

The classes involved are [`AVCaptureDevice`](../api/av-capture-device.md) (a camera), [`AVCaptureSession`](../api/av-capture-session.md) (capture), [`AVCaptureDeviceInput`](../api/av-capture-device-input.md) (connecting a camera to the capture), [`AVCaptureMetadataOutput`](../api/av-capture-metadata-output.md) (recognizing codes), [`AVCaptureVideoPreviewLayer`](../api/av-capture-video-preview-layer.md) (showing the feed), and [`AVMetadataMachineReadableCodeObject`](../api/av-metadata-machine-readable-code-object.md) (a recognized code). Recognizing codes in an image uses [`BarcodeDetector`](../api/barcode-detector.md).

Before you start, install `@nacrejs/av-capture` and write `NSCameraUsageDescription` in `nacre.config.json`; see [`AVCaptureSession`](../api/av-capture-session.md#installation). If you only recognize codes in images, you don't need this package.

## Recommended approach

- **Ask for permission first, then connect the camera.** Use `AVCaptureDevice.requestAccessForMediaType('video')`, and when the user refuses, show a different screen that tells them. See [Ask for permission first](#ask-for-permission-first).
- **Build it in this order:** create the session → add the camera input → add the metadata output → set the types to recognize → put the preview layer into a view → start capturing. The output must be added to a session that already has a camera before you can set the types to recognize.
- **Recognize only the types you need.** To scan QR codes, write just `['qrCode']`.
- **With a scan frame, use `rectOfInterest` to recognize only codes inside it.** Convert the frame's position with the preview layer instead of computing it yourself, and do it after capture starts. See [Only recognize codes inside a frame](#only-recognize-codes-inside-a-frame).
- **Stop after a scan.** Call `stopRunning()` once a code is recognized, and also when leaving the scanning page. The camera drains the battery while it's on. See [Stop after a scan](#stop-after-a-scan).
- **Lock the camera before changing the flashlight, focus, or zoom, and unlock it in `finally`.** See [Turn on the flashlight](#turn-on-the-flashlight).
- **Use this package for the live camera feed, and `BarcodeDetector` for existing images.** See [Recognize codes in an image](#recognize-codes-in-an-image).

## First example

Starting from a blank app: an area near the top of the page shows the rear camera feed, and a line of text below shows the result. When a QR code is recognized, its content is shown and capture stops.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/av-capture" />

application.addEventListener('sceneconnect', (e) => {
  // Create the window and the page. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // The area that shows the feed, and a line of text for the result
  const box = new UIView();
  box.frame = new CGRect(20, 120, 320, 320);
  box.backgroundColor = 'black';
  page.view.addSubview(box);

  const result = new UILabel();
  result.frame = new CGRect(20, 460, 320, 44);
  result.text = 'Point the camera at a QR code';
  page.view.addSubview(result);

  startScanner(box, result);
});

/**
 * @param {UIView} box the view that shows the feed
 * @param {UILabel} result the label that shows the result
 */
async function startScanner(box, result) {
  // 1. Ask for permission
  const granted = await AVCaptureDevice.requestAccessForMediaType('video');
  const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
  if (!granted || camera === null) {
    result.text = 'No permission to use the camera';
    return;
  }

  // 2. Create the session and connect the rear camera
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));

  // 3. Add the output that recognizes codes, and set the types to recognize
  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode'];

  // 4. Fill the view with the camera feed
  const preview = new AVCaptureVideoPreviewLayer(session);
  preview.videoGravity = 'resizeAspectFill';
  preview.frame = box.bounds;
  box.layer.addSublayer(preview);

  // 5. When a code is recognized: show it and stop capturing
  output.addEventListener('detect', (event) => {
    const code = event.objects[0];
    if (code instanceof AVMetadataMachineReadableCodeObject) {
      result.text = code.stringValue ?? 'The code does not contain text';
      session.stopRunning();
    }
  }, { once: true });

  // 6. Start capturing
  await session.startRunning();
}
```

**Effect**

- On the first run, the system first shows an alert asking the user whether to allow camera access; the alert shows the `NSCameraUsageDescription` sentence. If the user refuses, the line of text below changes to `No permission to use the camera`.
- After the user allows it, the rear camera feed appears in the 320 × 320 pt black area near the top, filling it. What the feed looks like in the area is **not verified on a device**.
- Point the camera at a QR code: the line of text below changes to the code's content, and capture stops.

This code hasn't been run as a whole. Every API it uses has run in the acceptance tests on a device, including recognizing the content of a QR code.

The six steps are: ask for permission, connect the camera, add the output that recognizes codes, fill the view with the feed, listen for `detect`, and start capturing.

The sections below reuse these variables. The variables in the first example are created inside a function, so later sections can't see them. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const box = new UIView();
box.frame = new CGRect(20, 120, 320, 320);
page.view.addSubview(box);

const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
const session = new AVCaptureSession();
const output = new AVCaptureMetadataOutput();
if (camera !== null) {
  session.addInput(new AVCaptureDeviceInput(camera));
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode'];
}

const preview = new AVCaptureVideoPreviewLayer(session);
preview.videoGravity = 'resizeAspectFill';
preview.frame = box.bounds;
box.layer.addSublayer(preview);
```

**Effect**: When the user has already allowed camera access, this creates a session connected to the rear camera, an output that recognizes only QR codes, and a preview layer that fills `box`. Capture hasn't started yet.

## Ask for permission first

The user must agree before the app uses the camera. There are four possible decisions, read from `authorizationStatusForMediaType('video')`:

| Value | Meaning | What to do |
| --- | --- | --- |
| `'notDetermined'` | Not asked yet | Call `requestAccessForMediaType('video')`; the system shows an alert |
| `'authorized'` | Allowed | Connect the camera |
| `'denied'` | Refused | Tell the user to turn it on in the system Settings. Asking again shows no alert |
| `'restricted'` | Not allowed by a restriction on the device, which the user can't change | Tell the user this device can't use the camera |

```js
async function cameraAccess() {
  const status = AVCaptureDevice.authorizationStatusForMediaType('video');
  if (status === 'notDetermined') {
    return (await AVCaptureDevice.requestAccessForMediaType('video')) ? 'authorized' : 'denied';
  }
  return status;
}

cameraAccess().then((status) => {
  if (status === 'authorized') {
    console.log('The camera can be used');
  } else if (status === 'denied') {
    console.log('Please allow this app to use the camera in Settings');
  } else {
    console.log('This device cannot use the camera');
  }
});
```

**Effect**

- When the user hasn't been asked yet, an alert appears; after the user chooses, the matching line is printed. After the user allows it, the status is `'authorized'` (verified by testing).
- Running it again after asking shows no alert and prints the previous result right away (verified by testing).
- The output when the user refuses or the device is restricted is **not verified on a device**.

Two things to know:

- The alert appears even without asking first: calling `new AVCaptureDeviceInput(camera)` before the user has been asked shows the same alert at that moment (verified by testing). Asking first lets you know the result before connecting the camera.
- Without permission, `new AVCaptureDeviceInput(camera)` throws an [`NSError`](../api/ns-error.md) (verified by testing). So confirm permission first, then create the input.

## Only recognize codes inside a frame

Scanning pages often draw a frame in the middle of the feed for the user to put the code in. The frame is an ordinary view placed on top of the preview layer. To ignore codes outside it, convert the frame's position into the metadata output's [`rectOfInterest`](../api/av-capture-metadata-output/rectofinterest.md):

```js
// 1. Draw the frame: a view with a border, on top of the preview layer
const scanFrame = new UIView();
scanFrame.frame = new CGRect(50, 50, 220, 220);
scanFrame.layer.borderColor = 'systemYellow';
scanFrame.layer.borderWidth = 2;
scanFrame.layer.cornerRadius = 12;
box.addSubview(scanFrame);

// 2. After capture starts, convert the frame's position into rectOfInterest
session.startRunning().then(() => {
  output.rectOfInterest = preview.metadataOutputRectOfInterestForRect(scanFrame.frame);
  console.log(String(output.rectOfInterest));
});
```

**Effect**

- A 220 × 220 pt yellow frame with rounded corners appears in the middle of the feed. The frame is added to `box` later, so it shows on top of the feed. What the frame looks like on screen is **not verified on a device**.
- The console prints the converted rectangle; all four numbers are between 0 and 1.
- From then on, only codes inside the frame fire `detect`; codes outside it don't count. This is **not verified on a device**.

A few notes:

- **Convert the frame's position with the preview layer instead of computing it yourself.** `rectOfInterest` uses proportional coordinates in the picture, oriented by the camera's picture, which isn't the same coordinate system as points on screen; see [Coordinates in the picture](../api/av-capture-metadata-output.md#coordinates-in-the-picture). `metadataOutputRectOfInterestForRect()` accounts for the layer's size and `videoGravity`.
- **Convert after capture starts.** The measurement was taken while capturing: the whole layer converts to a rectangle within 0 to 1. The value computed before capture starts is **not verified on a device**.
- `scanFrame.frame` is in `box` coordinates. The preview layer fills `box` (`preview.frame = box.bounds`), so these are also coordinates in the layer, and can be passed straight to the layer to convert.
- If the layer's size or `videoGravity` changes, convert again.

## Draw a box around each code

The positions of codes recognized in a `detect` event are proportional coordinates in the picture and can't be drawn on screen directly. Convert them with the preview layer's [`transformedMetadataObjectForMetadataObject()`](../api/av-capture-video-preview-layer/transformedmetadataobjectformetadataobject.md); the converted code's `bounds` and `corners` are points in the layer.

The example below uses a shape layer to draw a green outline through the code's four corners. Codes can be tilted, and the four corners joined together fit more tightly than the `bounds` rectangle:

```js
const outline = new CAShapeLayer();
outline.strokeColor = 'systemGreen';
outline.fillColor = null;
outline.lineWidth = 3;
outline.frame = preview.bounds;
preview.addSublayer(outline);

/** @type {number | undefined} */
let clearOutline;

output.addEventListener('detect', (e) => {
  const path = new UIBezierPath();
  for (const found of e.objects) {
    // Convert to the layer: corners become points in the layer
    const moved = preview.transformedMetadataObjectForMetadataObject(found);
    if (!(moved instanceof AVMetadataMachineReadableCodeObject)) continue;
    const [first, ...rest] = moved.corners;
    if (first === undefined) continue;
    path.moveToPoint(first);
    for (const corner of rest) path.addLineToPoint(corner);
    path.closePath();
  }

  // No transition animation when changing the path, so the outline keeps up with the code
  CATransaction.begin();
  CATransaction.setDisableActions(true);
  outline.path = path;
  CATransaction.commit();

  // Once the code leaves the camera there is no more detect: clear it after 0.3 seconds without a new frame
  clearTimeout(clearOutline);
  clearOutline = setTimeout(() => {
    outline.path = null;
  }, 300);
});
```

**Effect**: While a code is in front of the camera, a 3 pt green line runs along its four edges on the feed, and follows the code as it moves. The line disappears 0.3 seconds after the code leaves the camera. What it looks like is **not verified on a device**; that the converted object is still a code object is verified by testing.

- While a code stays in front of the camera, `detect` arrives frame after frame, and the path is replaced each frame.
- There's no event when a code leaves the picture, so a timer clears the stale outline.
- For why the transition animation is turned off, see [Transition animations when changing properties](../api/ca-layer.md#transition-animations-when-changing-properties).

## Several codes in one frame

When a frame of the picture has several codes, the `objects` of the `detect` event contains all of them. Scanning two QR codes side by side on a screen, one frame recognized 2 codes, both with the right content (verified by testing).

You can then draw a box around each code and let the user tap one. The example below puts a bordered button over each code, and the button follows the code; whichever the user taps is used, and capture stops:

```js
/** @type {Map<string, { button: UIButton, seenAt: number }>} */
const choices = new Map();

output.addEventListener('detect', (e) => {
  const now = Date.now();
  for (const found of e.objects) {
    const moved = preview.transformedMetadataObjectForMetadataObject(found);
    if (!(moved instanceof AVMetadataMachineReadableCodeObject) || moved.stringValue === null) continue;
    const value = moved.stringValue;

    // One button per code (identified by content); move it every frame after that
    let choice = choices.get(value);
    if (choice === undefined) {
      const button = UIButton.buttonWithType('custom');
      button.layer.borderColor = 'systemGreen';
      button.layer.borderWidth = 3;
      button.addEventListener('click', () => {
        console.log('Picked ' + value);
        session.stopRunning();
      });
      box.addSubview(button);
      choice = { button, seenAt: now };
      choices.set(value, choice);
    }
    choice.button.frame = moved.bounds;
    choice.seenAt = now;
  }
});

// Remove the button of any code that hasn't been recognized for a while
setInterval(() => {
  const now = Date.now();
  for (const [value, choice] of choices) {
    if (now - choice.seenAt > 500) {
      choice.button.removeFromSuperview();
      choices.delete(value);
    }
  }
}, 250);
```

**Effect**: With two codes in front of the camera, each is surrounded by a green box on the feed, and the boxes follow the codes as they move. Tap one of the boxes: the console prints `Picked ` and that code's content, and capture stops. Half a second after a code leaves the camera, its box disappears. The effect of this code is **not verified on a device**.

- The buttons are positioned with the converted `bounds`. The preview layer fills `box`, so points in the layer are points in `box`.
- Codes are told apart by their content. When two codes have the same content, there is only one button.
- How many codes can be recognized in one frame was only measured up to 2.

If you only want the first code recognized, you don't need this; see [Stop after a scan](#stop-after-a-scan).

## Stop after a scan

`detect` arrives for every frame in which a code stays in front of the camera. To get it only once, do two things: have the listener receive it only once, and stop capturing after recognizing a code.

```js
/** @returns {Promise<string | null>} the text in the code; null when the code does not contain text */
function scanOnce() {
  return new Promise((resolve) => {
    output.addEventListener('detect', (e) => {
      const code = e.objects[0];
      session.stopRunning();
      resolve(code instanceof AVMetadataMachineReadableCodeObject ? code.stringValue : null);
    }, { once: true });
    session.startRunning();
  });
}

scanOnce().then((text) => {
  console.log('Scanned: ' + text);
});
```

**Effect**: Capture starts; when the first QR code is recognized, the console prints `Scanned: ` and the code's content, and capture stops. To scan again, call `scanOnce()` again.

- `{ once: true }` removes the listener automatically after it receives one event, so the few extra frames that arrive before capture stops don't trigger it again.
- [`stopRunning()`](../api/av-capture-session/stoprunning.md) returns a Promise that is fulfilled once capture has stopped; after that `isRunning` is `false` (verified by testing).

Also stop when leaving the scanning page, and start again when coming back:

```js
page.addEventListener('disappear', () => {
  session.stopRunning();
});
page.addEventListener('appear', () => {
  session.startRunning();
});
```

**Effect**: Capture stops when the page leaves the screen and starts again when it comes back. Starting a session that is already capturing is also fulfilled (verified by testing), so there's no need to check `isRunning` first.

## Turn on the flashlight

Codes can't be read in dim light; you can turn on the flashlight next to the camera. Lock the camera before changing the flashlight:

```js
/** @param {boolean} on */
function setTorch(on) {
  if (camera === null || !camera.hasTorch || !camera.isTorchAvailable) return;
  camera.lockForConfiguration();
  try {
    camera.torchMode = on ? 'on' : 'off';
  } finally {
    camera.unlockForConfiguration();
  }
}

const torchButton = UIButton.buttonWithType('system');
torchButton.setTitle('Flashlight', { forState: ['normal'] });
torchButton.frame = new CGRect(20, 460, 100, 44);
page.view.addSubview(torchButton);
torchButton.addEventListener('click', () => {
  setTorch(camera !== null && camera.torchMode !== 'on');
});
```

**Effect**: Tap "Flashlight" and the flashlight turns on; tap again and it turns off. Whether the flashlight actually lights up is **not verified on a device**; reading and writing `torchMode` is verified by testing.

- [`hasTorch`](../api/av-capture-device/hastorch.md) is whether there is a flashlight; it is `true` for the rear camera of an iPhone 14 (verified by testing). [`isTorchAvailable`](../api/av-capture-device/istorchavailable.md) is whether it can be used right now.
- Writing `torchMode` without locking throws a [`DOMException`](../api/dom-exception.md) whose `name` is `'InvalidStateError'`, and leaves the value unchanged (verified by testing).
- When the lock can't be taken (for example, another app is using the camera), `lockForConfiguration()` throws an [`NSError`](../api/ns-error.md); this case is **not verified on a device**. `finally` makes sure the lock is released even if an error occurs while changing settings.

## Focus faster on nearby codes

When scanning, the code is usually close to the lens. Restricting autofocus to near distances keeps the camera from searching for focus far away:

```js
if (camera !== null) {
  camera.lockForConfiguration();
  try {
    camera.autoFocusRangeRestriction = 'near';
    if (camera.isFocusModeSupported('continuousAutoFocus')) {
      camera.focusMode = 'continuousAutoFocus';
    }
  } finally {
    camera.unlockForConfiguration();
  }
  console.log(camera.autoFocusRangeRestriction, camera.focusMode);
}
```

**Effect**: The console prints `near continuousAutoFocus` (verified by testing: written and read back on the rear camera of an iPhone 14). Whether focusing actually gets faster is **not verified on a device**.

- Focus is `'continuousAutoFocus'` (always autofocusing) by default (verified by testing). It's written above so that it changes back after another focus mode was used.
- When the camera doesn't support restricting the focus range, writing `autoFocusRangeRestriction` throws a `DOMException` whose `name` is `'InvalidStateError'`. This case is **not verified on a device**.

## Zoom in

When a code is small or far away, you can zoom in on the picture:

```js
if (camera !== null) {
  const factor = Math.min(2, camera.maxAvailableVideoZoomFactor);
  camera.lockForConfiguration();
  try {
    camera.videoZoomFactor = factor;
  } finally {
    camera.unlockForConfiguration();
  }
  console.log(camera.videoZoomFactor);
}
```

**Effect**: The console prints `2` (verified by testing: written and read back). Whether the picture zooms to 2× is **not verified on a device**.

- The factor must be between [`minAvailableVideoZoomFactor`](../api/av-capture-device/minavailablevideozoomfactor.md) and [`maxAvailableVideoZoomFactor`](../api/av-capture-device/maxavailablevideozoomfactor.md). On the rear camera of an iPhone 14 it's 1 to 123.75 (verified by testing). Out of range throws `RangeError` (verified by testing).
- To zoom in gradually instead of jumping, use [`rampToVideoZoomFactor()`](../api/av-capture-device/ramptovideozoomfactor.md).

## When the session is interrupted

The system interrupts capture on an incoming call, when the app goes to the background, or when another app takes the camera. The session fires [`interrupt`](../api/av-capture-session/interrupt-event.md), which carries the reason; when the interruption ends it fires [`interruptend`](../api/av-capture-session/interruptend-event.md). When an error occurs during capture it fires [`runtimeerror`](../api/av-capture-session/runtimeerror-event.md).

```js
const status = new UILabel();
status.frame = new CGRect(20, 510, 320, 44);
page.view.addSubview(status);

session.addEventListener('interrupt', (e) => {
  status.text = e.reason === 'videoDeviceInUseByAnotherClient'
    ? 'Another app is using the camera'
    : 'Capture paused';
});
session.addEventListener('interruptend', () => {
  status.text = '';
  if (!session.isRunning) session.startRunning();
});
session.addEventListener('runtimeerror', (e) => {
  status.text = 'Capture error: ' + e.error.message;
});
```

**Effect**: When capture is interrupted, the line of text below explains why; when the interruption ends, the text is cleared, and the session starts again if it isn't capturing. When these three events arrive on a device, and whether the session resumes capturing on its own after an interruption, are **not verified on a device**.

## Recognize codes in an image

When the code is already in an image (a photo the user took, an image picked from the photo library, a downloaded image), use [`BarcodeDetector`](../api/barcode-detector.md), which is in the core. It needs no package and no camera permission.

```js
/** @param {UIImage | Blob} image */
async function readCodes(image) {
  const detector = new BarcodeDetector({ formats: ['qr_code'] });
  const codes = await detector.detect(image);
  if (codes.length === 0) {
    console.log('No QR code in the image');
    return;
  }
  for (const code of codes) {
    console.log(code.rawValue);
  }
}

const bundled = UIImage.imageNamed('JS/assets/qr');
if (bundled !== null) readCodes(bundled);
```

**Effect**: When the project's `assets/qr.png` contains a QR code, the console prints the code's content. Verified by testing: an image with one code yields one code with the right content; an image with two codes yields two; an image with no code yields an empty array.

When the image comes from elsewhere, pass the `UIImage` you get to `readCodes()`:

| Where the image comes from | How to get a `UIImage` |
| --- | --- |
| A photo the user took with the system interface | `originalImage` of the [`pick`](../api/ui-image-picker-controller/pick-event.md) event in `@nacrejs/camera`; see [Taking a photo](take-photo.md) |
| An image the user picked from the photo library | `itemProvider.loadObjectOfClass(UIImage)` of the item picked with `@nacrejs/photos`; see [Picking photos and saving them to the photo library](pick-photos.md#loading-an-image-from-a-picked-item) |
| An image downloaded from the internet | `blob()` of the `Response` from `fetch()`; pass the `Blob` straight to `readCodes()` |

- Positions in the result are in pixels of the image, with the origin at the top-left corner; see [`detect()`](../api/barcode-detector/detect.md).
- To find out which formats this device recognizes, use [`BarcodeDetector.getSupportedFormats()`](../api/barcode-detector/getsupportedformats.md).

## See also

- [`AVCaptureSession`](../api/av-capture-session.md): capture, and how to install `@nacrejs/av-capture`
- [`AVCaptureDevice`](../api/av-capture-device.md): permission, flashlight, focus, zoom
- [`AVCaptureMetadataOutput`](../api/av-capture-metadata-output.md): the types to recognize, the area, the `detect` event, coordinates in the picture
- [`AVCaptureVideoPreviewLayer`](../api/av-capture-video-preview-layer.md): showing the feed, converting coordinates
- [`AVMetadataMachineReadableCodeObject`](../api/av-metadata-machine-readable-code-object.md): a recognized code
- [`BarcodeDetector`](../api/barcode-detector.md): recognizing codes in images
- [Configuring an app](project-config.md#writing-usage-descriptions): how to write usage descriptions, and per language
