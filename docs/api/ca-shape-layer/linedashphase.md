---
type: reference
native: CAShapeLayer.lineDashPhase
---

# `CAShapeLayer`：`lineDashPhase` 属性

**`lineDashPhase`** 属性决定虚线从图案的哪个位置开始画。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `0`。
- 只在 [`lineDashPattern`](linedashpattern.md) 不是 `null` 时起作用。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const shape = new CAShapeLayer();
shape.lineDashPattern = [6, 3];
shape.lineDashPhase = 3;
console.log(shape.lineDashPhase);
```

**结果**：控制台输出 `3`。虚线从图案的第 3 pt 处开始画，**未在模拟器验证**。

## 对应的 iOS API

`CAShapeLayer.lineDashPhase`。

## 参见

- [`lineDashPattern`](linedashpattern.md)
