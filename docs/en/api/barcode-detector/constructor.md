---
type: reference
web: BarcodeDetector()
---

# `BarcodeDetector()` constructor

The **`BarcodeDetector()`** constructor creates a detector that finds barcodes in images. You can specify which formats it looks for.

## Syntax

```
new BarcodeDetector()
new BarcodeDetector({ formats })
```

### Parameters

**`options.formats`**

Optional. An array of the format names to look for:

| Value | Format |
| --- | --- |
| `'qr_code'` | QR codes |
| `'aztec'` | Aztec codes |
| `'data_matrix'` | Data Matrix codes |
| `'pdf417'` | PDF417 codes |
| `'code_128'` | Code 128 barcodes |
| `'code_39'` | Code 39 barcodes |
| `'code_93'` | Code 93 barcodes |
| `'codabar'` | Codabar barcodes |
| `'itf'` | ITF barcodes (Interleaved 2 of 5 and ITF-14) |
| `'ean_13'` | EAN-13 product barcodes |
| `'ean_8'` | EAN-8 product barcodes |
| `'upc_a'` | UPC-A product barcodes |
| `'upc_e'` | UPC-E product barcodes |

- Passing no `options`, `null`, or `{}`, or a `formats` of `undefined`: looks for every format this device recognizes (verified by testing: none of these throw).
- Each item in the array is converted to a string.
- Writing a format this device doesn't recognize (see [`getSupportedFormats()`](getsupportedformats.md)) doesn't throw, but that format is never recognized. `'upc_a'` is like this: you can write it, but testing found the iPhone 14 doesn't recognize it.

Look only for the formats you need. To scan QR codes, write `{ formats: ['qr_code'] }`; codes in other formats don't appear in the results even when they're in the image (verified by testing: when looking only for `'ean_13'`, a QR code isn't reported).

### Return value

A new `BarcodeDetector`.

### Exceptions

**`TypeError`**

- `formats` contains an unknown name: `BarcodeDetector formats has no value "qr"; expected one of: aztec, code_128, …`, listing all 13 names. `'unknown'` counts as unknown too (verified by testing).
- `formats` is an empty array: `BarcodeDetector formats must not be empty` (verified by testing).
- `formats` isn't an array (for example, a string): `BarcodeDetector formats must be an array of format names, got …` (verified by testing).
- `options` isn't an object: `BarcodeDetector options must be an object, got …`.
- Subclassing it: `class Mine extends BarcodeDetector {}` throws on `new Mine()`: `Illegal constructor: Mine extends BarcodeDetector, but subclassing native classes is not supported yet` (verified by testing to throw `TypeError`).

## Examples

```js
const anyCode = new BarcodeDetector();
const qrOnly = new BarcodeDetector({ formats: ['qr_code'] });
console.log(anyCode instanceof BarcodeDetector, qrOnly instanceof BarcodeDetector);
```

**Result**: The console prints `true true`. `anyCode` looks for every format this device recognizes; `qrOnly` looks only for QR codes.

## Differences from the web

Same as the web.

## See also

- [`getSupportedFormats()`](getsupportedformats.md): which formats this device recognizes
- [`detect()`](detect.md): find barcodes in an image
