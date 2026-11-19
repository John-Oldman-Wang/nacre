---
type: reference
native: UIScrollView.panGestureRecognizer
---

# `UIScrollView`：`panGestureRecognizer` 属性

**`panGestureRecognizer`** 属性是滚动视图用来识别拖动的手势识别器。

## 值

[`UIPanGestureRecognizer`](../ui-gesture-recognizer.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 读两次是同一个对象（实测）。
- 是一个 `UIPanGestureRecognizer`（实测）。
- 拿到它之后能做什么（读拖动的速度、和别的手势配合），**未在模拟器验证**。

## 示例

```js
const scroller = new UIScrollView();
const pan = scroller.panGestureRecognizer;
console.log(pan instanceof UIPanGestureRecognizer, pan === scroller.panGestureRecognizer);
```

**结果**：输出 `true true`。

## 对应的 iOS API

`UIScrollView.panGestureRecognizer`。

## 参见

- [手势识别器](../ui-gesture-recognizer.md)
