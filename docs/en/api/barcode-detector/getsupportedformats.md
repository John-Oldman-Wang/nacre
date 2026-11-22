---
type: reference
web: BarcodeDetector.getSupportedFormats()
---

# `BarcodeDetector.getSupportedFormats()` static method

The **`BarcodeDetector.getSupportedFormats()`** static method asks which barcode formats this device recognizes.

## Syntax

```
BarcodeDetector.getSupportedFormats()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with an array of format names, in alphabetical order, with no duplicates (that there are no duplicates is verified by testing). The names all come from the table in [`BarcodeDetector()`](constructor.md#parameters).

On an iPhone 14 (iOS 27.2) it was measured to fulfill with 12 formats: everything in the table except `'upc_a'`.

### Exceptions

None.

## Examples

```js
BarcodeDetector.getSupportedFormats().then((formats) => {
  console.log(formats.join(', '));
  console.log(formats.includes('qr_code'));
});
```

**Result**: On an iPhone 14 it prints `aztec, codabar, code_128, code_39, code_93, data_matrix, ean_13, ean_8, itf, pdf417, qr_code, upc_e`, then `true`.

## Differences from the web

Same as the web. `'upc_a'` can be written in the constructor options, but it isn't in this list and is never recognized.

## See also

- [`BarcodeDetector()`](constructor.md): look only for certain formats
