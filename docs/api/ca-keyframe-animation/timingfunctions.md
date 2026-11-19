---
type: reference
native: CAKeyframeAnimation.timingFunctions
---

# `CAKeyframeAnimation`：`timingFunctions` 属性

**`timingFunctions`** 属性给相邻两个值之间的每一段各指定一条[时间曲线](../ca-media-timing-function.md)。

## 值

[`CAMediaTimingFunction`](../ca-media-timing-function.md) 的数组。

- 可读，可写。
- 默认值是 `[]`。
- 每段一条，个数比 [`values`](values.md) 少一。
- 读出来是写进去的那些对象。
- 写 `null` 或 `undefined` 等于写 `[]`。
- [`calculationMode`](calculationmode.md) 是 `'paced'` 或 `'cubicPaced'` 时不起作用。

### 写错时

数组里有不是时间曲线的项：抛 `TypeError: timingFunctions needs an array of CAMediaTimingFunction`。

## 示例

```js
const bounce = CAKeyframeAnimation.animationWithKeyPath('opacity');
bounce.values = [1, 0, 1];
bounce.timingFunctions = [
  CAMediaTimingFunction.functionWithName('easeIn'),
  CAMediaTimingFunction.functionWithName('easeOut'),
];
console.log(bounce.timingFunctions.length);
```

**效果**：控制台输出 `2`。加到图层上之后，变淡的一段先慢后快，恢复的一段先快后慢。**画面上的表现未在模拟器验证。**

## 对应的 iOS API

`CAKeyframeAnimation.timingFunctions`。

## 参见

- [`CAAnimation.timingFunction`](../ca-animation/timingfunction.md)：整个动画用一条曲线
