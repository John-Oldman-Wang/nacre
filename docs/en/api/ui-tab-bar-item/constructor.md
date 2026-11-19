---
type: reference
native: "-[UITabBarItem initWithTitle:image:selectedImage:]"
---

# `UITabBarItem()` constructor

The **`UITabBarItem()`** constructor creates a tab.

## Syntax

```
new UITabBarItem()
new UITabBarItem({ title, image, selectedImage, tag, badgeValue, badgeColor })
```

### Parameters

The argument is an object, and all six entries are optional. Each one has the same effect as writing the corresponding property after creation:

**`options.title`**

The text below the icon; see [`title`](../ui-bar-item/title.md).

**`options.image`**

The icon, a [`UIImage`](../ui-image.md); see [`image`](../ui-bar-item/image.md).

**`options.selectedImage`**

The icon used when selected; see [`selectedImage`](selectedimage.md).

**`options.tag`**

A number for your own use; see [`tag`](../ui-bar-item/tag.md).

**`options.badgeValue`**

The text in the badge; see [`badgeValue`](badgevalue.md).

**`options.badgeColor`**

The badge's background color; see [`badgeColor`](badgecolor.md).

### Return value

The new `UITabBarItem`.

### Exceptions

Invalid entries produce the same errors as writing the corresponding properties.

## Examples

```js
const empty = new UITabBarItem();
const item = new UITabBarItem({
  title: 'Home',
  image: UIImage.systemImageNamed('house'),
  selectedImage: UIImage.systemImageNamed('house.fill'),
  tag: 7,
  badgeValue: '3',
  badgeColor: 'systemIndigo',
});
console.log(empty.title, item.title, item.tag, item.badgeValue, item.badgeColor);
```

**Result**: The console prints `null Home 7 3 systemIndigo`.

## Corresponding iOS API

`-[UITabBarItem initWithTitle:image:selectedImage:]`. In native code, `tag`, `badgeValue`, and `badgeColor` are properties set after creation; here they can also go in the argument.

## See also

- [`UIViewController.tabBarItem`](../ui-view-controller/tabbaritem.md): attaching it to a view controller
