---
type: reference
native: UIBezierPath.usesEvenOddFillRule
---

# `UIBezierPath`：`usesEvenOddFillRule` 属性

**`usesEvenOddFillRule`** 属性决定 [`containsPoint()`](containspoint.md) 用哪种规则判断一个点在不在形状内部。

## 值

布尔。

- 可读，可写。
- 默认值是 `false`。
- `false`：用非零规则。`true`：用奇偶规则。两种规则的含义见 [`CAShapeLayer`](../ca-layer.md#cashapelayer) 的 `fillRule`。
- 写入按 `Boolean(v)` 转换，所以 `'false'` 得到 `true`。
- 它对 `containsPoint()` 结果的影响**未在模拟器验证**。

> **注意**：这个属性不影响形状图层怎么填充。图层只看自己的 `fillRule`。

## 示例

```js
const path = new UIBezierPath();
path.usesEvenOddFillRule = true;
console.log(path.usesEvenOddFillRule);
```

**结果**：控制台输出 `true`。

## 对应的 iOS API

`UIBezierPath.usesEvenOddFillRule`。

## 参见

- [`containsPoint()`](containspoint.md)
