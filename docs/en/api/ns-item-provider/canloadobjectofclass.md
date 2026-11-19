---
type: reference
native: "-[NSItemProvider canLoadObjectOfClass:]"
---

# `NSItemProvider`: `canLoadObjectOfClass()` method

The **`canLoadObjectOfClass()`** method checks whether an object of a certain class can be retrieved from this item.

## Syntax

```
canLoadObjectOfClass(aClass)
```

### Parameters

**`aClass`**

A class itself, not a string. Currently it can only be `UIImage`.

### Return value

A boolean. `true`: a `UIImage` can be retrieved with [`loadObjectOfClass()`](loadobjectofclass.md). `false` when the selected item is a video.

### Exceptions

**`TypeError`**

`aClass` isn't `UIImage`:

```
canLoadObjectOfClass supports only UIImage for now, got UIColor
```

## Examples

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  const provider = new NSItemProvider(photo);
  console.log(provider.canLoadObjectOfClass(UIImage));
}
```

**Result**: prints `true`.

## Corresponding iOS API

`-[NSItemProvider canLoadObjectOfClass:]`. ObjC passes `UIImage.class`; JS passes `UIImage`.

## See also

- [`loadObjectOfClass()`](loadobjectofclass.md)
- This class belongs to the `@nacrejs/photos` package; for installation, see [Install first](../photos.md#installation)
