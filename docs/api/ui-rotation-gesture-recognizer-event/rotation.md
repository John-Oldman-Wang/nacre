---
type: reference
native: UIRotationGestureRecognizerEvent.rotation
---

# `UIRotationGestureRecognizerEvent`：`rotation` 属性

**`rotation`** 属性是相对手势开始时转过的角度。

## 值

数，单位是弧度。顺时针为正。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `0`。

## 示例

```js
const dial = new UIView();
const turn = new UIRotationGestureRecognizer();
turn.addEventListener('changed', (e) => {
  dial.transform = CGAffineTransform.rotation(e.rotation);
});
dial.addGestureRecognizer(turn);
```

**效果**：两指在 `dial` 上转动，`dial` 跟着转。

## 对应的 iOS API

`recognizer.rotation`。

## 参见

- [`UIRotationGestureRecognizerEvent`](../ui-rotation-gesture-recognizer-event.md)
