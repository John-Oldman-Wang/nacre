---
type: reference
native: CAKeyframeAnimation.keyTimes
---

# `CAKeyframeAnimation`：`keyTimes` 属性

**`keyTimes`** 属性给出 [`values`](values.md) 里每个值出现的时刻。

## 值

数的数组，或者 `null`。每一项是 0 到 1 的比例，没有单位：0 是动画开始，1 是结束。

- 可读，可写。
- 默认值是 `null`，表示各个值之间的间隔相等。
- 个数和 `values` 相同。
- [`calculationMode`](calculationmode.md) 是 `'paced'` 或 `'cubicPaced'` 时不起作用。

### 写错时

抛 `TypeError`：

- 不是数组也不是 `null`：`keyTimes must be an array of numbers or null, got …`
- 某一项转换不出有限数：`keyTimes[0] must be a finite number, got …`

## 示例

```js
const blink = CAKeyframeAnimation.animationWithKeyPath('opacity');
blink.values = [1, 0.2, 1, 0.2, 1];
blink.keyTimes = [0, 0.2, 0.5, 0.7, 1];
blink.duration = 1.5;
console.log((blink.keyTimes || []).join(','));
```

**结果**：控制台输出 `0,0.2,0.5,0.7,1`。加到图层上之后，第一次变淡在 0.3 秒，恢复在 0.75 秒。**画面上的表现未在模拟器验证。**

## 对应的 iOS API

`CAKeyframeAnimation.keyTimes`。

## 参见

- [`values`](values.md)
- [`timingFunctions`](timingfunctions.md)
