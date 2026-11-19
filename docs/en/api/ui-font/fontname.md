---
type: reference
native: UIFont.fontName
---

# `UIFont`: `fontName` property

The **`fontName`** property is the specific font name. System fonts have names starting with a dot, such as `.SFUI-Regular` and `.SFUI-Bold`.

## Value

A string, determined by the font.

A system font's `fontName` is not guaranteed to retrieve it again through [`fontWithName()`](fontwithname.md) (**not verified in the simulator**). For a named font, you can use its `fontName` to get the same font at a different size.

- Read-only. Assigning to it throws `TypeError`.
- Font objects are immutable, so this value never changes for the object's lifetime, and there is no change notification.

## Examples

```js
const font = UIFont.systemFontOfSize(34, { weight: 'bold' });
console.log(font.fontName);
```

**Result**: the console logs `.SFUI-Bold`.

## Corresponding iOS API

`UIFont.fontName`.

## See also

- [Font metrics](../ui-font.md#font-metrics)
