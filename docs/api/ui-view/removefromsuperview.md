---
type: reference
native: "-[UIView removeFromSuperview]"
---

# `UIView`：`removeFromSuperview()` 方法

**`removeFromSuperview()`** 方法把视图从它的父视图里移除。

## 语法

```
removeFromSuperview()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

对没有父视图的视图调用是否报错，**未在模拟器验证**。

## 说明

- 移除之后视图是否还存在，取决于 App 的代码有没有保存它。有变量保存着它时，视图还在，属性都保留，可以再用 `addSubview()` 加回去（**加回去未在模拟器验证**）。没有任何变量保存它时，视图连同它的子视图、事件监听一起被回收，不需要先调 `removeEventListener()`。
- 涉及它的约束一起被移除。**未在模拟器验证。**
- 移除 [`UIStackView`](../ui-stack-view.md) 的排列项也用这个方法，它同时把视图移出排列。

## 示例

```js
const card = new UIView();
const dot = new UIView();
card.addSubview(dot);

dot.removeFromSuperview();
console.log(dot.superview, card.subviews.length);
```

**效果**：`dot` 从屏幕上消失。控制台输出 `null 0`。

## 对应的 iOS API

`-[UIView removeFromSuperview]`。

## 参见

- [`addSubview()`](addsubview.md)
- [`isHidden`](ishidden.md)：暂时不显示
- [视图由谁保管](../../guides/views.md#视图由谁保管)
