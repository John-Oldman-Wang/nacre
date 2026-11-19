---
type: reference
native: CAGradientLayer.startPoint
---

# `CAGradientLayer`：`startPoint` 属性

**`startPoint`** 属性是渐变的起点，用单位坐标表示。

## 值

[`CGPoint`](../structs.md)，单位坐标：`(0, 0)` 是图层的左上角，`(1, 1)` 是右下角，和图层的实际大小无关。

- 可读，可写。
- 默认值是 `(0.5, 0)`。默认的起点和终点合起来是从上到下。
- 在不同的 [`type`](type.md) 下含义不同，见[单位坐标](../ca-gradient-layer.md#单位坐标)。
- 写入时可以给 `CGPoint`，也可以给 `{ x, y }`。

### 写错时

**`TypeError`**

给的不是对象，或者缺字段、字段不是有限的数。

## 示例

```js
const gradient = new CAGradientLayer();
gradient.startPoint = new CGPoint(0, 0.5);   // 左边的中点
console.log(gradient.startPoint.x, gradient.startPoint.y);
```

**结果**：控制台输出这个点的两个坐标。

## 对应的 iOS API

`CAGradientLayer.startPoint`。

## 参见

- [单位坐标](../ca-gradient-layer.md#单位坐标)
