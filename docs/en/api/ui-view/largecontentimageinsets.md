---
type: reference
native: UIView.largeContentImageInsets
---

# `UIView`: `largeContentImageInsets` property

The **`largeContentImageInsets`** property is the inset left around the image in the large content viewer.

## Value

A [`UIEdgeInsets`](../ui-edge-insets.md), in [pt](../units.md).

- Readable and writable.
- The default is **not verified in the simulator**.
- On write you can pass a `UIEdgeInsets` or a plain object with all four fields present. The fields of the struct that reads back are read-only, and each read returns a new object. See [Structs](../structs.md).
- The type it reads back as, and that writing back the original value reads back unchanged, are checked in the acceptance tests. The effect is **not verified in the simulator**.

### Invalid values

- Not an object: throws `TypeError: largeContentImageInsets needs an object with all of: top, left, bottom, right`.
- A field is missing or doesn't convert to a finite number: throws `TypeError: largeContentImageInsets is missing …, or it is not a finite number`, with the missing field name in the middle.
- On error the property keeps its previous value. Field values are converted with `Number()`, so `'10'` works.

## Examples

```js
const item = new UIView();
item.largeContentImageInsets = new UIEdgeInsets(4, 4, 4, 4);
console.log(String(item.largeContentImageInsets));
```

**Result**: Prints `UIEdgeInsets(4, 4, 4, 4)`. **Not verified in the simulator.**

## Corresponding iOS API

`UIView.largeContentImageInsets`.

## See also

- [`largeContentImage`](largecontentimage.md)
