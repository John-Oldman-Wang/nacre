---
type: reference
native: UIPinchGestureRecognizerEvent.scale
---

# `UIPinchGestureRecognizerEvent`：`scale` 属性

**`scale`** 属性是两指的间距相对手势开始时的倍数。

## 值

数，是倍数，没有单位。张开大于 1，捏拢小于 1。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `1`。

## 示例

```js
const photo = new UIView();
const pinch = new UIPinchGestureRecognizer();
pinch.addEventListener('changed', (e) => {
  photo.transform = CGAffineTransform.scale(e.scale, e.scale);
});
photo.addGestureRecognizer(pinch);
```

**效果**：两指在 `photo` 上张开或捏拢，`photo` 跟着放大或缩小。

## 对应的 iOS API

`recognizer.scale`。

## 参见

- [`UIPinchGestureRecognizerEvent`](../ui-pinch-gesture-recognizer-event.md)
