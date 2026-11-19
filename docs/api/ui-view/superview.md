---
type: reference
native: UIView.superview
---

# `UIView`：`superview` 属性

**`superview`** 属性是视图的父视图。

## 值

[`UIView`](../ui-view.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `null`。没有加到任何视图上时是 `null`。
- 读到的是同一个对象：加到视图树上的视图不需要另外保存在变量里。
- 没有变化通知。

## 示例

```js
const card = new UIView();
const dot = new UIView();
card.addSubview(dot);
console.log(dot.superview === card);
dot.removeFromSuperview();
console.log(dot.superview);
```

**结果**：依次输出 `true`、`null`。

## 对应的 iOS API

`UIView.superview`。

## 参见

- [`subviews`](subviews.md)、[`addSubview()`](addsubview.md)
- [视图树和叠放顺序](../ui-view.md#视图树和叠放顺序)
