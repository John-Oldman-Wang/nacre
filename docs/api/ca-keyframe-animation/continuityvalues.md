---
type: reference
native: CAKeyframeAnimation.continuityValues
---

# `CAKeyframeAnimation`：`continuityValues` 属性

**`continuityValues`** 属性调整平滑曲线在每个关键帧值附近的连续性。只在 [`calculationMode`](calculationmode.md) 是 `'cubic'` 或 `'cubicPaced'` 时有效。

## 值

数的数组，或者 `null`。每项对应 [`values`](values.md) 里的一个值，取值 −1 到 1，没有单位。

- 可读，可写。
- 默认值是 `null`。没给的项按 0 算。
- 效果**未在模拟器验证**。

### 写错时

抛 `TypeError`：

- 不是数组也不是 `null`：`continuityValues must be an array of numbers or null, got …`
- 某一项转换不出有限数：`continuityValues[0] must be a finite number, got …`

## 示例

```js
const wave = CAKeyframeAnimation.animationWithKeyPath('position');
wave.values = [new CGPoint(30, 80), new CGPoint(150, 20), new CGPoint(270, 80)];
wave.calculationMode = 'cubic';
wave.continuityValues = [0, 0.5, 0];
console.log((wave.continuityValues || []).join(','));
```

**结果**：控制台输出 `0,0.5,0`。中间那个值附近曲线的连续性改变。**画面上的表现未在模拟器验证。**

## 对应的 iOS API

`CAKeyframeAnimation.continuityValues`。

## 参见

- [`tensionValues`](tensionvalues.md)、[`biasValues`](biasvalues.md)
