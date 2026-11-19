---
type: reference
native: UITabBarController.tabBar
---

# `UITabBarController`：`tabBar` 属性

**`tabBar`** 属性是屏幕底部那一排标签。用它改标签的颜色。

## 值

[`UITabBar`](../ui-tab-bar.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读是同一个对象。

> **注意**：不要往 `tabBar` 上加子视图，也不要改它的 `frame`。它里面有什么由 [`viewControllers`](viewcontrollers.md) 决定。

## 示例

```js
const tabs = new UITabBarController();
tabs.tabBar.tintColor = 'systemPink';
console.log(tabs.tabBar === tabs.tabBar, tabs.tabBar.tintColor);
```

**结果**：控制台输出 `true systemPink`。

## 对应的 iOS API

`UITabBarController.tabBar`。

## 参见

- [`UITabBar`](../ui-tab-bar.md)
