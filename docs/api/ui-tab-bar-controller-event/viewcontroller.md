---
type: reference
native: UITabBarControllerEvent.viewController
---

# `UITabBarControllerEvent`：`viewController` 属性

**`viewController`** 属性是用户点中的那一页。

## 值

[`UIViewController`](../ui-view-controller.md)，是标签控制器的 `viewControllers` 里的一个。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const home = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, new UIViewController()];
tabs.addEventListener('tabselect', (e) => {
  console.log(e.viewController === home ? '首页' : '别的页');
});
```

**效果**：用户点标签切换时，输出点中的是不是首页。

## 对应的 iOS API

`tabBarController:didSelectViewController:` 的参数 `viewController`。

## 参见

- [`UITabBarControllerEvent`](../ui-tab-bar-controller-event.md)
