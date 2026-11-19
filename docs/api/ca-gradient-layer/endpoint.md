---
type: reference
native: CAGradientLayer.endPoint
---

# `CAGradientLayer`：`endPoint` 属性

**`endPoint`** 属性是渐变的终点，用单位坐标表示。

## 值

[`CGPoint`](../structs.md)，单位坐标：`(0, 0)` 是图层的左上角，`(1, 1)` 是右下角，和图层的实际大小无关。

- 可读，可写。
- 默认值是 `(0.5, 1)`。默认的起点和终点合起来是从上到下。
- 在不同的 [`type`](type.md) 下含义不同，见[单位坐标](../ca-gradient-layer.md#单位坐标)。
- 写入时可以给 `CGPoint`，也可以给 `{ x, y }`。

### 写错时

**`TypeError`**

给的不是对象，或者缺字段、字段不是有限的数。

## 示例

```js
const gradient = new CAGradientLayer();
gradient.endPoint = new CGPoint(1, 0.5);   // 右边的中点
console.log(gradient.endPoint.x, gradient.endPoint.y);
```

**结果**：控制台输出这个点的两个坐标。

## 对应的 iOS API

`CAGradientLayer.endPoint`。

## 参见

- [单位坐标](../ca-gradient-layer.md#单位坐标)
