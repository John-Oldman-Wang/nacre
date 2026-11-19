---
type: reference
native: UITabBarItem
status: partial
---

# `UITabBarItem`

**`UITabBarItem`** represents one tab in the bottom tab bar: the icon, the text below the icon, and the badge in the top-right corner. It hangs on a view controller's [`tabBarItem`](ui-view-controller/tabbaritem.md) and is shown once the view controller is put into a [`UITabBarController`](ui-tab-bar-controller.md).

The title, icon, whether it can be tapped, and the tag number are inherited from [`UIBarItem`](ui-bar-item.md).

**Inheritance**: `EventTarget` → `NSObject` → [`UIBarItem`](ui-bar-item.md) → `UITabBarItem`

## Constructor

[`UITabBarItem()`](ui-tab-bar-item/constructor.md)

Creates a tab, optionally with a title, icon, selected icon, tag number, and badge at the same time.

## Instance properties

Also inherits the properties of [`UIBarItem`](ui-bar-item.md): [`title`](ui-bar-item/title.md) (the text below the icon), [`image`](ui-bar-item/image.md) (the icon), [`isEnabled`](ui-bar-item/isenabled.md) (when `false`, grayed out and not tappable; how it looks is **not verified in the simulator**), and [`tag`](ui-bar-item/tag.md).

| Property | Description |
| --- | --- |
| [`selectedImage`](ui-tab-bar-item/selectedimage.md) | The icon used when selected |
| [`badgeValue`](ui-tab-bar-item/badgevalue.md) | The text in the badge in the top-right corner |
| [`badgeColor`](ui-tab-bar-item/badgecolor.md) | The badge's background color |

None of these properties fires an event when it changes: only code changes them.

## Examples

```js
const home = new UIViewController();
home.tabBarItem = new UITabBarItem({
  title: 'Home',
  image: UIImage.systemImageNamed('house'),
  selectedImage: UIImage.systemImageNamed('house.fill'),
});
home.tabBarItem.badgeValue = '3';
console.log(home.tabBarItem.title, home.tabBarItem.badgeValue);
```

**Result**: The console prints `Home 3`. After the view controller is put into a tab bar controller, its tab shows a house icon and "Home", with a red badge of 3 in the top-right corner. **How it looks is not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UITabBarItem alloc] initWithTitle:@"Home" image:img selectedImage:sel]` | `new UITabBarItem({ title: 'Home', image: img, selectedImage: sel })` |
| `item.badgeValue = @"3"` | `item.badgeValue = '3'` |
| `item.badgeColor = UIColor.systemIndigoColor` | `item.badgeColor = 'systemIndigo'` |

## See also

- [`UITabBarController`](ui-tab-bar-controller.md)
- [`UIBarItem`](ui-bar-item.md): the superclass
- [Building bottom tabs](../guides/tabs.md)
