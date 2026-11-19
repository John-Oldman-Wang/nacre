---
type: reference
native: UITabBarItem.badgeColor
---

# `UITabBarItem`: `badgeColor` property

The **`badgeColor`** property is the badge's background color.

## Value

A color string, or `null`.

- Readable and writable. Can be written as a color string or a `UIColor`; reads back as a string.
- The default is `null`: the system's default red.
- For how to write colors and what happens with invalid ones, see [Colors](../ui-color.md).
- No event fires when it changes: only code changes it.

## Examples

```js
const item = new UITabBarItem({ title: 'Messages', badgeValue: '5' });
item.badgeColor = 'systemIndigo';
console.log(item.badgeColor);
```

**Result**: The console prints `systemIndigo`. The badge's background becomes indigo; **how it looks is not verified in the simulator**.

## Corresponding iOS API

`UITabBarItem.badgeColor`. `UIColor.systemIndigoColor` is written `'systemIndigo'`.

## See also

- [`badgeValue`](badgevalue.md)
- [Colors](../ui-color.md)
