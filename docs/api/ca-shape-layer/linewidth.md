---
type: reference
native: CAShapeLayer.lineWidth
---

# `CAShapeLayer`：`lineWidth` 属性

**`lineWidth`** 属性是线宽。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `1`。
- 线以路径为中心，向两侧各占一半线宽。3 pt 粗的线，两侧各画出 1.5 pt。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const shape = new CAShapeLayer();
shape.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
shape.fillColor = null;
shape.strokeColor = 'systemBlue';
shape.lineWidth = 3;
```

**效果**：矩形的线框是 3 pt 粗。

## 对应的 iOS API

`CAShapeLayer.lineWidth`。

## 参见

- [`strokeColor`](strokecolor.md)
