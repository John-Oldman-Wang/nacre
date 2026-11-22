---
type: reference
native: UIPinchGestureRecognizerEvent.velocity
---

# `UIPinchGestureRecognizerEvent`：`velocity` 属性

**`velocity`** 属性是 [`scale`](scale.md) 每秒变化多少。

## 值

数，单位是倍数每秒。张开时为正，捏拢时为负。

- 只读。给它赋值抛 `TypeError`。
- 用 [`new`](constructor.md) 创建时没给，是 `0`。

## 示例

```js
const photo = new UIView();
const pinch = new UIPinchGestureRecognizer();
pinch.addEventListener('ended', (e) => {
  console.log(e.velocity > 0 ? '张开' : '捏拢');
});
photo.addGestureRecognizer(pinch);
```

**效果**：在 `photo` 上捏合后松手，按松手时的方向输出 `张开` 或 `捏拢`。

## 对应的 iOS API

`recognizer.velocity`。

## 参见

- [`UIPinchGestureRecognizerEvent`](../ui-pinch-gesture-recognizer-event.md)
