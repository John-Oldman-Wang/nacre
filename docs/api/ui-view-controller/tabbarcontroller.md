---
type: reference
native: UIViewController.tabBarController
---

# `UIViewController`：`tabBarController` 属性

**`tabBarController`** 属性是这个页面所在的 [`UITabBarController`](../ui-tab-bar-controller.md)。

## 值

`UITabBarController`，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `null`：页面不在任何标签栏控制器里。
- 页面放进标签栏控制器的 `viewControllers` 后指向它。
- 变化时不派发事件：它只在 App 的代码改变标签栏的页面时变化。

## 示例

```js
const home = new UIViewController();
console.log(home.tabBarController);

const tabs = new UITabBarController();
tabs.viewControllers = [home];
console.log(home.tabBarController === tabs);
```

**结果**：控制台依次输出 `null`、`true`。**未在模拟器验证。**

## 对应的 iOS API

`UIViewController.tabBarController`。

## 参见

- [`tabBarItem`](tabbaritem.md)
- [`navigationController`](navigationcontroller.md)
