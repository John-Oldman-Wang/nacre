---
type: reference
native: UIGestureRecognizerEvent.numberOfTouches
---

# `UIGestureRecognizerEvent`：`numberOfTouches` 属性

**`numberOfTouches`** 属性是事件发生时参与手势的手指个数。

## 值

数，单位是个。

- 只读。给它赋值抛 `TypeError`。
- 单指手势抬手时的 `ended` 里也是 1。
- 用 [`new`](constructor.md) 创建时没给，是 `0`。

## 示例

```js
const page = new UIViewController();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('changed', (e) => {
  console.log(e.numberOfTouches + ' 根手指');
});
page.view.addGestureRecognizer(drag);
```

**效果**：在页面上拖动时，输出参与的手指个数，比如 `1 根手指`。

## 对应的 iOS API

`recognizer.numberOfTouches`。

## 参见

- [`UIGestureRecognizerEvent`](../ui-gesture-recognizer-event.md)
