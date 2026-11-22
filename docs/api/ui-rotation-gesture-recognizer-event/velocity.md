---
type: reference
native: UIRotationGestureRecognizerEvent.velocity
---

# `UIRotationGestureRecognizerEvent`：`velocity` 属性

**`velocity`** 属性是旋转的速度。

## 值

数，单位是弧度每秒。顺时针为正。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `0`。

## 示例

```js
const dial = new UIView();
const turn = new UIRotationGestureRecognizer();
turn.addEventListener('ended', (e) => {
  console.log(e.velocity > 0 ? '顺时针' : '逆时针');
});
dial.addGestureRecognizer(turn);
```

**效果**：在 `dial` 上转动后松手，按松手时的方向输出 `顺时针` 或 `逆时针`。

## 对应的 iOS API

`recognizer.velocity`。

## 参见

- [`UIRotationGestureRecognizerEvent`](../ui-rotation-gesture-recognizer-event.md)
