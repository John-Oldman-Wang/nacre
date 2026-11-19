---
type: reference
native: CAShapeLayer.strokeStart
---

# `CAShapeLayer`：`strokeStart` 属性

**`strokeStart`** 属性决定描边从路径的哪里开始。

## 值

数，0 到 1 的比例。0 是路径的起点，1 是终点。

- 可读，可写。
- 默认值是 `0`。
- 和 [`strokeEnd`](strokeend.md) 一起，只画路径的一段。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const shape = new CAShapeLayer();
shape.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
shape.fillColor = null;
shape.strokeColor = 'systemBlue';
shape.strokeStart = 0.25;
```

**效果**：矩形的线框从路径四分之一处开始画，前四分之一不画。**未在模拟器验证。**

## 对应的 iOS API

`CAShapeLayer.strokeStart`。

## 参见

- [`strokeEnd`](strokeend.md)
