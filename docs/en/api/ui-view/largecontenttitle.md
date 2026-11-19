---
type: reference
native: UIView.largeContentTitle
---

# `UIView`: `largeContentTitle` property

The **`largeContentTitle`** property is the text shown in the large content viewer. See [`showsLargeContentViewer`](showslargecontentviewer.md).

## Value

A string, or `null`.

- Readable and writable.
- The default is **not verified in the simulator**.
- Writing `null` or `undefined` gives `null`; other values are converted to strings.
- The type that reads back, and that writing back the original value leaves it unchanged, are checked in the acceptance tests. The effect is **not verified in the simulator**.

## Examples

```js
const item = new UIView();
item.largeContentTitle = 'Favorites';
console.log(item.largeContentTitle);
```

**Result**: Logs `Favorites`.

## Corresponding iOS API

`UIView.largeContentTitle`.

## See also

- [`showsLargeContentViewer`](showslargecontentviewer.md)
