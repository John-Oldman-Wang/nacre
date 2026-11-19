---
type: reference
native: UIPinchGestureRecognizer.scale
---

# `UIPinchGestureRecognizer`：`scale` 属性

**`scale`** 属性是两指的间距相对手势开始时的倍数。

## 值

数，没有单位，是倍数。

- 可读，可写。
- 默认值是 `1`。大于 1 是张开，小于 1 是捏拢。每次手势都从 1 开始。
- 没有取值范围，0 和负数都可以写入并原样读回。
- 手势进行中写入，之后从写入的值接着计算。
- 回调里读到的是回调执行那一刻的值。事件发生那一刻的倍数在事件对象的 `scale` 上。

### 怎么得知它变了

它变了不派发单独的事件。手势进行中系统更新它，新的值随 [`changed`](../ui-gesture-recognizer/changed-event.md) 事件送到。

### 写错时

- 转不成数的值（`undefined`、`'soon'`、`NaN`）：抛 `TypeError: scale must be a finite number, got "soon"`。
- 数字字符串按数用：写 `'0.4'` 读回 `0.4`。
- 出错时属性保持原来的值。

## 示例

```js
const pinch = new UIPinchGestureRecognizer();
pinch.scale = 2;
console.log(pinch.scale);
```

**结果**：输出 `2`。

## 对应的 iOS API

`UIPinchGestureRecognizer.scale`。

## 参见

- [`velocity`](velocity.md)
- [`changed`](../ui-gesture-recognizer/changed-event.md)：事件对象上的 `scale`
