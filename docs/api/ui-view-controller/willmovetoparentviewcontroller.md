---
type: reference
native: "-[UIViewController willMoveToParentViewController:]"
---

# `UIViewController`：`willMoveToParentViewController()` 方法

**`willMoveToParentViewController()`** 方法通知系统：这个页面即将换父控制器。

## 语法

```
willMoveToParentViewController(parent)
```

### 参数

**`parent`**

新的父控制器，`UIViewController`；或者 `null`，表示即将离开父控制器。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

给的既不是页面也不是 `null`。

## 说明

- 加入时不用自己调：[`addChildViewController()`](addchildviewcontroller.md) 会自动调 `willMoveToParentViewController(parent)`。
- 移除时**要自己调** `willMoveToParentViewController(null)`，写在 [`removeFromParentViewController()`](removefromparentviewcontroller.md) 之前。
- 这个通知是发给系统的，JS 里收不到它：页面上没有对应的事件。漏掉它的后果**未在模拟器验证**。

## 示例

```js
const page = new UIViewController();
const panel = new UIViewController();
page.addChildViewController(panel);
panel.didMoveToParentViewController(page);

panel.willMoveToParentViewController(null);
panel.removeFromParentViewController();
console.log(panel.parentViewController);
```

**结果**：控制台输出 `null`。

## 对应的 iOS API

`-[UIViewController willMoveToParentViewController:]`。

## 参见

- [`didMoveToParentViewController()`](didmovetoparentviewcontroller.md)
- [父子控制器](../ui-view-controller.md#父子控制器)
