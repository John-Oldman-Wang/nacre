---
type: reference
native: UIGestureRecognizerEvent.location
---

# `UIGestureRecognizerEvent`：`location` 属性

**`location`** 属性是手势的位置，在识别器所在视图的坐标系里。

## 值

[`CGPoint`](../cg-point.md) 或 `null`，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError`。
- 多根手指时是它们的中心点。
- 要换算到别的视图的坐标系，用 [`UIView`](../ui-view.md) 的 `convertPoint()`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const card = new UIView();
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', (e) => {
  if (e.location !== null) {
    console.log('点在', e.location.x, e.location.y);
  }
});
card.addGestureRecognizer(tap);
```

**效果**：点一下 `card`，输出 `点在` 和点的位置。

## 对应的 iOS API

`[recognizer locationInView:recognizer.view]`。

## 参见

- [`UIGestureRecognizerEvent`](../ui-gesture-recognizer-event.md)
