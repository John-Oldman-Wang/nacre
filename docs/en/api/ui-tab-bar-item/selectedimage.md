---
type: reference
native: UITabBarItem.selectedImage
---

# `UITabBarItem`: `selectedImage` property

The **`selectedImage`** property is the icon used when the tab is selected.

## Value

A [`UIImage`](../ui-image.md), or `null`.

- Readable and writable.
- The default is `null`: [`image`](../ui-bar-item/image.md) is still used when selected.
- No event fires when it changes: only code changes it.

> **Note:** What you read back is not the object you wrote (verified by testing). The system stores a separate copy when it is written, with the same size; repeated reads give the same copy, but comparing it with the object written using `===` gives `false`. `image` does not behave this way.

## Examples

```js
const fill = UIImage.systemImageNamed('house.fill');
const item = new UITabBarItem({ title: 'Home', image: UIImage.systemImageNamed('house') });
item.selectedImage = fill;
console.log(item.selectedImage !== null, item.selectedImage === fill);
```

**Result**: The console prints `true false`. When this tab is selected, a filled house icon is shown.

## Corresponding iOS API

`UITabBarItem.selectedImage`.

## See also

- [`image`](../ui-bar-item/image.md)
