---
type: reference
native: CAKeyframeAnimation.calculationMode
---

# `CAKeyframeAnimation`：`calculationMode` 属性

**`calculationMode`** 属性决定关键帧的值与值之间怎么过渡。

## 值

字符串，下面五个之一：

| 取值 | 效果 |
| --- | --- |
| `'linear'` | 相邻两个值之间直线过渡 |
| `'discrete'` | 不过渡。到了时刻直接换成下一个值 |
| `'paced'` | 直线过渡，并且全程匀速。[`keyTimes`](keytimes.md) 和 [`timingFunctions`](timingfunctions.md) 不起作用 |
| `'cubic'` | 用平滑的曲线经过每个值，拐弯处没有折角 |
| `'cubicPaced'` | 平滑曲线，并且全程匀速。`keyTimes` 和 `timingFunctions` 不起作用 |

- 可读，可写。
- 默认值是 `'linear'`。
- `'cubic'` 和 `'cubicPaced'` 的效果**未在模拟器验证**。它们的曲线形状可以用 [`tensionValues`](tensionvalues.md)、[`continuityValues`](continuityvalues.md)、[`biasValues`](biasvalues.md) 调整。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，`calculationMode` 保持原来的值。

## 示例

```js
const jump = CAKeyframeAnimation.animationWithKeyPath('fillColor');
jump.values = ['systemRed', '#FFCC00', 'systemGreen'];
jump.calculationMode = 'discrete';
jump.duration = 1.8;
```

**效果**：加到形状图层上之后，依次显示红、黄、绿三种颜色，每种停留一段时间后直接换成下一种，没有渐变。

## 对应的 iOS API

`CAKeyframeAnimation.calculationMode`。`kCAAnimationDiscrete` 写成 `'discrete'`，其余同理。

## 参见

- [不渐变，到时间直接换](../../guides/animation.md#不渐变到时间直接换)
- [枚举](../enums.md)
