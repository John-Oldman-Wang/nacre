---
type: reference
native: UIBarItem.image
---

# `UIBarItem`: `image` property

The **`image`** property is the icon on a navigation bar button or tab.

## Value

A [`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- The default is `null`.
- How the icon looks on the navigation bar is **not verified in the simulator**.
- No event fires when it changes: only code changes it.

### Invalid values

- Writing some other native object: throws `TypeError: image needs a UIImage or null`.
- Writing a plain value such as a string or number: throws `TypeError`, with a message starting with `image needs a native object or null, got`.

## Examples

```js
const share = new UIBarButtonItem();
share.image = UIImage.systemImageNamed('square.and.arrow.up');
console.log(share.image !== null);
```

**Result**: The console prints `true`. Once the button is on the navigation bar, it shows a share icon; **how it looks is not verified in the simulator**.

`'square.and.arrow.up'` is a name in SF Symbols, the system's built-in icon library; see [`UIImage`](../ui-image.md). When the name does not exist, `systemImageNamed()` returns `null`, and writing `null` means no icon.

## Corresponding iOS API

`UIBarItem.image`.

## See also

- [`title`](title.md)
