---
type: reference
native: UITabBar.unselectedItemTintColor
---

# `UITabBar`：`unselectedItemTintColor` 属性

**`unselectedItemTintColor`** 属性是没选中的标签的颜色。

## 值

颜色字符串，或者 `null`。

- 可读，可写。写入时可以是颜色字符串或 `UIColor`，读出来是字符串。
- 默认值是 `null`：系统默认的灰色。
- 颜色的写法和写错时的行为见[颜色](../ui-color.md)。
- 变化时不派发事件：它只会被代码改变。

## 示例

```js
const tabs = new UITabBarController();
tabs.tabBar.unselectedItemTintColor = 'systemGray';
console.log(tabs.tabBar.unselectedItemTintColor);
```

**结果**：控制台输出 `systemGray`。没选中的标签变成灰色，**颜色的实际效果未在模拟器验证**。

## 对应的 iOS API

`UITabBar.unselectedItemTintColor`。

## 参见

- [`tintColor`](tintcolor.md)
