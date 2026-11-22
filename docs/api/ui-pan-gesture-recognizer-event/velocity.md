---
type: reference
native: UIPanGestureRecognizerEvent.velocity
---

# `UIPanGestureRecognizerEvent`：`velocity` 属性

**`velocity`** 属性是这个事件发生时手指移动的速度。

## 值

[`CGPoint`](../cg-point.md)，在识别器所在视图的坐标系里，单位是 [pt](../units.md) 每秒。`x`、`y` 的正负号和 [`translation`](translation.md) 相同。

- 只读。给它赋值抛 `TypeError`。
- `ended` 里是松手那一刻的速度，可以用来判断是不是「甩」了一下。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const card = new UIView();
const drag = new UIPanGestureRecognizer();
drag.addEventListener('ended', (e) => {
  if (e.velocity.x > 1000) {
    console.log('向右甩出');
  }
});
card.addGestureRecognizer(drag);
```

**效果**：在 `card` 上快速向右滑动后松手，输出 `向右甩出`。

## 对应的 iOS API

`[recognizer velocityInView:recognizer.view]`。

## 参见

- [`UIPanGestureRecognizerEvent`](../ui-pan-gesture-recognizer-event.md)
