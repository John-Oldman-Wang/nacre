---
type: reference
native: UIControlTouchEvent.location
---

# `UIControlTouchEvent`：`location` 属性

**`location`** 属性是手指的位置，在这个控件自己的坐标系里。

## 值

[`CGPoint`](../cg-point.md) 或 `null`，单位 [pt](../units.md)。`(0, 0)` 是控件的左上角。

- 只读。给它赋值抛 `TypeError`。
- 由 [`sendActionsForControlEvents()`](../ui-control/sendactionsforcontrolevents.md) 派发的事件没有真实的触摸，是 `null`。`null` 和 `(0, 0)` 不同：`(0, 0)` 是一个真实存在的位置。
- 是事件发生那一刻的位置。回调执行时触摸可能已经结束，控件上没有保存触摸的位置。
- 要换算到别的视图的坐标系，用 [`UIView`](../ui-view.md) 的 `convertPoint()`。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const card = new UIControl();
card.addEventListener('touchupinside', (e) => {
  if (e.location !== null) {
    console.log(e.location.x, e.location.y);
  }
});
```

**效果**：手指在 `card` 上松开时，输出手指在 `card` 里的横坐标和纵坐标。

## 对应的 iOS API

`[touch locationInView:control]`：action 方法的 `UIEvent` 里那个 `UITouch` 在控件里的位置。

## 参见

- [`UIControlTouchEvent`](../ui-control-touch-event.md)
- [`tapCount`](tapcount.md)
