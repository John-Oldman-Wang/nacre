---
type: reference
native: UIRotationGestureRecognizer.rotation
---

# `UIRotationGestureRecognizer`：`rotation` 属性

**`rotation`** 属性是相对手势开始时转过的角度。

## 值

数，单位是**弧度**。

- 可读，可写。
- 默认值是 `0`。每次手势都从 0 开始。
- 可以是负数，超过一圈时不折回：写 `-7` 读回 `-7`。
- 手势进行中写入，之后从写入的值接着计算。
- 正值对应顺时针还是逆时针**未在模拟器验证**。
- 回调里读到的是回调执行那一刻的值。事件发生那一刻的角度在事件对象的 `rotation` 上。

### 怎么得知它变了

它变了不派发单独的事件。手势进行中系统更新它，新的值随 [`changed`](../ui-gesture-recognizer/changed-event.md) 事件送到。

### 写错时

- 转不成数的值（`undefined`、`'soon'`、`NaN`）：抛 `TypeError: rotation must be a finite number, got "soon"`。
- 数字字符串按数用：写 `'0.4'` 读回 `0.4`。
- 出错时属性保持原来的值。

## 示例

```js
const twist = new UIRotationGestureRecognizer();
twist.rotation = -7;
console.log(twist.rotation);
```

**结果**：输出 `-7`。

## 对应的 iOS API

`UIRotationGestureRecognizer.rotation`。

## 参见

- [`velocity`](velocity.md)
- [`changed`](../ui-gesture-recognizer/changed-event.md)：事件对象上的 `rotation`
