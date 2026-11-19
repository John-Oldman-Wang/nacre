---
type: reference
native: UIRotationGestureRecognizer.velocity
---

# `UIRotationGestureRecognizer`：`velocity` 属性

**`velocity`** 属性是旋转的速度。

## 值

数，单位是弧度每秒。

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `0`。没有手势在进行时是 0。

### 怎么得知它变了

它变了不派发单独的事件。手势进行中的值随 [`changed`](../ui-gesture-recognizer/changed-event.md) 事件的 `velocity` 送到。

## 示例

```js
const twist = new UIRotationGestureRecognizer();
console.log(twist.velocity);
```

**结果**：输出 `0`。

## 对应的 iOS API

`UIRotationGestureRecognizer.velocity`。

## 参见

- [`rotation`](rotation.md)
