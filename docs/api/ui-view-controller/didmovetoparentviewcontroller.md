---
type: reference
native: "-[UIViewController didMoveToParentViewController:]"
---

# `UIViewController`：`didMoveToParentViewController()` 方法

**`didMoveToParentViewController()`** 方法通知系统：这个页面已经换好父控制器。

## 语法

```
didMoveToParentViewController(parent)
```

### 参数

**`parent`**

新的父控制器，`UIViewController`；或者 `null`，表示已经离开父控制器。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

给的既不是页面也不是 `null`：`didMoveToParentViewController needs a UIViewController or null`。

## 说明

- 加入时**要自己调** `didMoveToParentViewController(parent)`，写在 [`addChildViewController()`](addchildviewcontroller.md) 和 `addSubview()` 之后。
- 移除时不用自己调：[`removeFromParentViewController()`](removefromparentviewcontroller.md) 会自动调 `didMoveToParentViewController(null)`。
- 这个通知是发给系统的，JS 里收不到它：页面上没有对应的事件。漏掉它的后果**未在模拟器验证**。

## 示例

```js
const page = new UIViewController();
const panel = new UIViewController();
page.addChildViewController(panel);
page.view.addSubview(panel.view);
panel.didMoveToParentViewController(page);
console.log(panel.parentViewController === page);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`-[UIViewController didMoveToParentViewController:]`。

## 参见

- [`willMoveToParentViewController()`](willmovetoparentviewcontroller.md)
- [父子控制器](../ui-view-controller.md#父子控制器)
