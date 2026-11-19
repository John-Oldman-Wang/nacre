---
type: reference
native: UIViewController.parentViewController
---

# `UIViewController`：`parentViewController` 属性

**`parentViewController`** 属性是包含这个页面的父控制器。

## 值

`UIViewController`，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `null`。
- 页面在导航栈里时，它就是那个导航控制器。
- 被 [`addChildViewController()`](addchildviewcontroller.md) 和 [`removeFromParentViewController()`](removefromparentviewcontroller.md) 改变，也在页面被推入、弹出导航栈时变化。
- 父子关系变了没有事件：它只会被 App 自己的代码改变。

## 示例

```js
const page = new UIViewController();
const panel = new UIViewController();
page.addChildViewController(panel);
panel.didMoveToParentViewController(page);
console.log(panel.parentViewController === page);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`UIViewController.parentViewController`。

## 参见

- [父子控制器](../ui-view-controller.md#父子控制器)
- [`childViewControllers`](childviewcontrollers.md)
