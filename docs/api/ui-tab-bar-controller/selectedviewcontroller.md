---
type: reference
native: UITabBarController.selectedViewController
---

# `UITabBarController`：`selectedViewController` 属性

**`selectedViewController`** 属性是选中的那个页面。

## 值

`UIViewController`，或者 `null`。

- 可读，可写。写入的必须是 [`viewControllers`](viewcontrollers.md) 里的一个。
- 默认值是第一个页面；没有页面时是 `null`。
- 和 [`selectedIndex`](selectedindex.md) 是同一件事的两种写法，改一个另一个跟着变。
- 被用户改变时派发 [`tabselect`](tabselect-event.md)。**被代码改变时不派发**（实测）。

### 写错时

写入不在 `viewControllers` 里的页面：抛 `TypeError: selectedViewController must be one of this tab bar controller's viewControllers`。

## 示例

```js
const home = new UIViewController();
const profile = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, profile];

tabs.selectedViewController = profile;
console.log(tabs.selectedIndex);
```

**结果**：界面切到第二个标签。控制台输出 `1`。

## 对应的 iOS API

`UITabBarController.selectedViewController`。

## 参见

- [`selectedIndex`](selectedindex.md)
