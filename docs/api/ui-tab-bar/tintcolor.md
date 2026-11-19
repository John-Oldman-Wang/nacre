---
type: reference
native: UITabBar.tintColor
---

# `UITabBar`：`tintColor` 属性

**`tintColor`** 属性是选中的标签（图标和文字）的颜色。

## 值

颜色字符串，或者 `null`。

- 可读，可写。写入时可以是颜色字符串或 `UIColor`，读出来是字符串。
- 默认值是 `'systemBlue'`。
- 颜色的写法和写错时的行为见[颜色](../ui-color.md)。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const tabs = new UITabBarController();
console.log(tabs.tabBar.tintColor);
tabs.tabBar.tintColor = 'systemPink';
console.log(tabs.tabBar.tintColor);
```

**结果**：先输出 `systemBlue`，再输出 `systemPink`。选中的标签变成粉色，**颜色的实际效果未在模拟器验证**。

## 对应的 iOS API

`UITabBar.tintColor`（继承自 `UIView`，这里只在 `UITabBar` 上提供）。

## 参见

- [`unselectedItemTintColor`](unselecteditemtintcolor.md)
