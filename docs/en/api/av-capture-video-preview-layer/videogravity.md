---
type: reference
native: AVCaptureVideoPreviewLayer.videoGravity
---

# `AVCaptureVideoPreviewLayer`: `videoGravity` property

The **`videoGravity`** property is how the picture fills the layer when the picture and the layer have different aspect ratios.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'resizeAspect'` | Keeps the picture's proportions and fits the whole picture. When the proportions differ, the layer has empty space on the sides or at the top and bottom |
| `'resizeAspectFill'` | Keeps the picture's proportions and fills the whole layer. The excess is cropped |
| `'resize'` | Stretches the picture to the size of the layer; the proportions change |

- Readable and writable.
- The default is `'resizeAspect'` (verified by testing).
- Writing `'resizeAspectFill'` reads back as `'resizeAspectFill'` (verified by testing).
- The on-screen effect of the three values is **not verified on a device**.
- Only your own code changes it, so there is no change notification.

A scanning viewfinder usually uses `'resizeAspectFill'`: the picture fills the area with no empty space. The cropped part isn't on screen, so the user can't see codes there.

### Invalid values

Writing a value not in the table: no exception is thrown; the console prints a warning listing all valid values, and `videoGravity` keeps its previous value (verified by testing).

## Examples

```js
const preview = new AVCaptureVideoPreviewLayer(new AVCaptureSession());
preview.videoGravity = 'resizeAspectFill';
console.log(preview.videoGravity);
```

**Effect**: The console prints `resizeAspectFill`. While the session is capturing, the picture fills the layer while keeping its proportions (**not verified on a device**).

## Corresponding iOS API

`AVCaptureVideoPreviewLayer.videoGravity`. `AVLayerVideoGravityResizeAspectFill` is written as `'resizeAspectFill'`, and so on for the rest.

## See also

- [`AVCaptureVideoPreviewLayer()`](constructor.md)
- [Enums](../enums.md): why an invalid property value gives a warning instead of throwing
