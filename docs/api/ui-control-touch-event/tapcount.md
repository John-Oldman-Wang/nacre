---
type: reference
native: UIControlTouchEvent.tapCount
---

# `UIControlTouchEvent`：`tapCount` 属性

**`tapCount`** 属性是连击次数：手指在同一处快速点了几下。

## 值

数，单位是次。第一次点是 1，紧接着的第二次是 2。

- 只读。给它赋值抛 `TypeError`。
- 由 [`sendActionsForControlEvents()`](../ui-control/sendactionsforcontrolevents.md) 派发的事件没有真实的触摸，是 `0`。
- 用 [`new`](constructor.md) 创建时没给，是 `0`。

## 示例

```js
const card = new UIControl();
card.addEventListener('touchdownrepeat', (e) => {
  if (e.tapCount === 2) {
    console.log('双击');
  }
});
```

**效果**：在 `card` 上快速点两下，输出 `双击`。

## 对应的 iOS API

`UITouch` 的 `tapCount`。

## 参见

- [`UIControlTouchEvent`](../ui-control-touch-event.md)
- [`touchdownrepeat`](../ui-control/touchdownrepeat-event.md)
