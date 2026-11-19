---
type: reference
native: UIPinchGestureRecognizer.velocity
---

# `UIPinchGestureRecognizer`：`velocity` 属性

**`velocity`** 属性是 `scale` 每秒变化多少。

## 值

数，单位是倍数每秒。

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `0`。没有手势在进行时是 0。

### 怎么得知它变了

它变了不派发单独的事件。手势进行中的值随 [`changed`](../ui-gesture-recognizer/changed-event.md) 事件的 `velocity` 送到。

## 示例

```js
const pinch = new UIPinchGestureRecognizer();
console.log(pinch.velocity);
```

**结果**：输出 `0`。

## 对应的 iOS API

`UIPinchGestureRecognizer.velocity`。

## 参见

- [`scale`](scale.md)
