---
type: reference
native: AVCaptureMetadataOutput.metadataObjectTypes
---

# `AVCaptureMetadataOutput`: `metadataObjectTypes` property

The **`metadataObjectTypes`** property lists the types this output looks for in the picture. When one of these types appears in the picture, the output fires [`detect`](detect-event.md).

## Value

An array of type names. The names you can write:

| Value | What it recognizes |
| --- | --- |
| `'qrCode'` | QR codes |
| `'microQRCode'` | Micro QR codes: small QR codes with a single finder pattern |
| `'aztecCode'` | Aztec codes: 2D codes with a square bull's-eye finder pattern in the center |
| `'dataMatrixCode'` | Data Matrix codes |
| `'pdf417Code'` | PDF417 codes: rectangular codes made of many rows of bars stacked together |
| `'microPDF417Code'` | Micro PDF417 codes |
| `'code128Code'` | Code 128 barcodes |
| `'code39Code'` | Code 39 barcodes |
| `'code39Mod43Code'` | Code 39 barcodes with a mod 43 check digit |
| `'code93Code'` | Code 93 barcodes |
| `'codabarCode'` | Codabar barcodes |
| `'ean13Code'` | EAN-13 product barcodes (13 digits) |
| `'ean8Code'` | EAN-8 product barcodes (8 digits) |
| `'upceCode'` | UPC-E product barcodes |
| `'interleaved2of5Code'` | Interleaved 2 of 5 barcodes |
| `'itf14Code'` | ITF-14 shipping barcodes |
| `'gs1DataBarCode'`, `'gs1DataBarExpandedCode'`, `'gs1DataBarLimitedCode'` | The GS1 DataBar family of barcodes |
| `'face'` | Human faces |
| `'humanBody'`, `'humanFullBody'` | Human bodies, full human bodies |
| `'catHead'`, `'catBody'`, `'dogHead'`, `'dogBody'` | Cat heads and bodies, dog heads and bodies |
| `'salientObject'` | The most prominent thing in the picture |
| `'focusTrackedObject'`, `'cinematicVideoMetadata'` | Available from iOS 27 |

- Readable and writable.
- The default is an empty array: nothing is recognized (verified by testing).
- You can only write names that are in [`availableMetadataObjectTypes`](availablemetadataobjecttypes.md). Before the output is added to a session that has a camera connected, that list is empty, and writing any name throws `TypeError` (verified by testing).
- The array you write is copied. Changing the original array afterwards doesn't affect the output, and each read returns a new array.
- Writing `['qrCode', 'ean13Code']` reads back as `['qrCode', 'ean13Code']` (verified by testing).
- A recognized code arrives as an [`AVMetadataMachineReadableCodeObject`](../av-metadata-machine-readable-code-object.md); other types arrive as an [`AVMetadataObject`](../av-metadata-object.md). Recognition of types other than codes is **not verified on a device**.
- Only your own code changes it, so there is no change notification.

Write only the types you actually need. Fewer types mean faster recognition and fewer false matches; to scan QR codes, write just `['qrCode']`.

### Invalid values

**`TypeError`**

- The name is known but can't be recognized right now (the output hasn't been added to a session with a camera, or this camera can't recognize that type): `metadataObjectTypes "…" is not available now; read availableMetadataObjectTypes first (it is empty until the output is added to a session that has a camera input)`. The value stays unchanged (verified by testing).
- The value isn't an array: `metadataObjectTypes must be an array of type names, got …`.

**Warning**

The array contains a name that isn't known: no exception is thrown; the console prints a warning listing all valid values. The whole assignment has no effect, and the value stays as it was (verified by testing).

## Examples

```js
const camera = AVCaptureDevice.defaultDeviceWithMediaType('video');
if (camera !== null && AVCaptureDevice.authorizationStatusForMediaType('video') === 'authorized') {
  const session = new AVCaptureSession();
  session.addInput(new AVCaptureDeviceInput(camera));
  const output = new AVCaptureMetadataOutput();
  session.addOutput(output);
  output.metadataObjectTypes = ['qrCode', 'ean13Code'];
  console.log(output.metadataObjectTypes.join(','));
}
```

**Effect**: When access is granted, the console prints `qrCode,ean13Code`. Once the session starts capturing, this output looks for QR codes and EAN-13 product barcodes.

## Corresponding iOS API

`AVCaptureMetadataOutput.metadataObjectTypes`. `AVMetadataObjectTypeQRCode` is written as `'qrCode'`, `AVMetadataObjectTypeEAN13Code` as `'ean13Code'`, and so on for the rest. In ObjC, writing a type that can't be recognized makes the system raise `NSInvalidArgumentException`; here it throws `TypeError`.

## See also

- [`availableMetadataObjectTypes`](availablemetadataobjecttypes.md): what can be chosen right now
- [`detect`](detect-event.md): something was recognized
- [`rectOfInterest`](rectofinterest.md): look only in part of the picture
