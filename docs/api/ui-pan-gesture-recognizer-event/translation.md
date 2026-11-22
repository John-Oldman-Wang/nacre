---
type: reference
native: UIPanGestureRecognizerEvent.translation
---

# `UIPanGestureRecognizerEvent`：`translation` 属性

**`translation`** 属性是从手势开始到这个事件为止，手指移动了多少。

## 值

[`CGPoint`](../cg-point.md)，在识别器所在视图的坐标系里，单位 [pt](../units.md)。`x` 为正是向右，`y` 为正是向下。

- 只读。给它赋值抛 `TypeError`。
- `began` 里接近 `(0, 0)`。
- 是累计的距离，不是和上一个事件之间的差。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
let start = card.center;
drag.addEventListener('began', () => {
  start = card.center;
});
drag.addEventListener('changed', (e) => {
  card.center = new CGPoint(start.x + e.translation.x, start.y + e.translation.y);
});
card.addGestureRecognizer(drag);
```

**效果**：`card` 跟着手指移动。

## 对应的 iOS API

`[recognizer translationInView:recognizer.view]`。

## 参见

- [`UIPanGestureRecognizerEvent`](../ui-pan-gesture-recognizer-event.md)
