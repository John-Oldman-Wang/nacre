---
type: reference
native: UITabBarController.selectedIndex
---

# `UITabBarController`：`selectedIndex` 属性

**`selectedIndex`** 属性是选中的标签是第几个，从 0 数。

## 值

整数。

- 可读，可写。
- 有页面时默认值是 `0`；没有页面时是 `-1`。用户选中系统的「更多」时也是 `-1`。
- 和 [`selectedViewController`](selectedviewcontroller.md) 是同一件事的两种写法，改一个另一个跟着变。
- 被用户改变时派发 [`tabselect`](tabselect-event.md)。**被代码改变时不派发**（实测）。

### 写错时

超出范围：抛 `TypeError: selectedIndex 3 is out of range; there are 3 view controllers`。

## 示例

```js
const home = new UIViewController();
const profile = new UIViewController();
const tabs = new UITabBarController();
tabs.viewControllers = [home, profile];

tabs.selectedIndex = 1;
console.log(tabs.selectedViewController === profile);
```

**效果**：界面切到第二个标签。控制台输出 `true`。

## 对应的 iOS API

`UITabBarController.selectedIndex`。原生的 `NSNotFound` 在这里是 `-1`。

## 参见

- [`selectedViewController`](selectedviewcontroller.md)
- [选中项变了怎么知道](../ui-tab-bar-controller.md#选中项变了怎么知道)
