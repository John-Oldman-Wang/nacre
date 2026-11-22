# @nacrejs/av-capture

Live camera capture for [Nacre](https://github.com/John-Oldman-Wang/nacre): show the camera feed, and recognize QR codes, barcodes and faces in it.

```sh
npm install @nacrejs/av-capture
```

Installing the package is what adds `AVCaptureSession`, `AVCaptureDevice`, `AVCaptureDeviceInput`, `AVCaptureMetadataOutput` and `AVCaptureVideoPreviewLayer` to your app. It needs a camera usage description: put it in `nacre.config.json`.

```json
{ "ios": { "infoPlist": { "NSCameraUsageDescription": "Scan QR codes." } } }
```

```js
const device = AVCaptureDevice.defaultDeviceWithMediaType('video');
const session = new AVCaptureSession();
session.addInput(new AVCaptureDeviceInput(device));
const output = new AVCaptureMetadataOutput();
session.addOutput(output);
output.metadataObjectTypes = ['qrCode'];
output.addEventListener('detect', (e) => console.log(e.objects[0].stringValue));
await session.startRunning();
```

To find codes in a still image, use `BarcodeDetector`, which is built into Nacre and needs no package.

License: FSL-1.1-MIT.
