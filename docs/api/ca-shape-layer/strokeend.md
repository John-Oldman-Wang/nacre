---
type: reference
native: CAShapeLayer.strokeEnd
---

# `CAShapeLayer`：`strokeEnd` 属性

**`strokeEnd`** 属性决定描边到路径的哪里结束。

## 值

数，0 到 1 的比例。0 是路径的起点，1 是终点。

- 可读，可写。
- 默认值是 `1`。
- 做进度环时改它。图层已经显示过时，修改会带一段过渡动画，见[改属性时的过渡动画](../ca-layer.md#改属性时的过渡动画)。
- 给它做动画能让线一点点画出来，见 [`CABasicAnimation`](../ca-basic-animation.md)。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const circle = UIBezierPath.bezierPathWithArcCenter(new CGPoint(150, 80), {
  radius: 40, startAngle: -Math.PI / 2, endAngle: Math.PI * 1.5, clockwise: true,
});
const ring = new CAShapeLayer();
ring.path = circle;
ring.fillColor = null;
ring.strokeColor = 'systemGreen';
ring.lineWidth = 8;
ring.strokeEnd = 0.6;
```

**效果**：一个半径 40 pt 的绿色圆环，从正上方开始沿顺时针方向画了 60%。**未在模拟器验证。**

## 对应的 iOS API

`CAShapeLayer.strokeEnd`。

## 参见

- [`strokeStart`](strokestart.md)
