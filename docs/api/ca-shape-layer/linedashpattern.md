---
type: reference
native: CAShapeLayer.lineDashPattern
---

# `CAShapeLayer`：`lineDashPattern` 属性

**`lineDashPattern`** 属性是虚线的画法：依次是画多长、空多长，到数组末尾后从头循环。

## 值

数的数组，单位 [pt](../units.md)；或者 `null`。

- 可读，可写。
- 默认值是 `null`，实线。设回 `null` 变回实线。

### 写错时

**`TypeError`**

某一项转换不出有限数：`lineDashPattern[0] must be a finite number, got …`。

## 示例

```js
const shape = new CAShapeLayer();
shape.path = UIBezierPath.bezierPathWithRect(new CGRect(20, 20, 260, 120));
shape.fillColor = null;
shape.strokeColor = 'systemGray';
shape.lineDashPattern = [6, 3];
```

**效果**：一个灰色虚线框。每段线长 6 pt，间隔 3 pt。**未在模拟器验证。**

## 对应的 iOS API

`CAShapeLayer.lineDashPattern`。`@[@4, @2]` 写成 `[4, 2]`。

## 参见

- [`lineDashPhase`](linedashphase.md)
