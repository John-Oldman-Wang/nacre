---
type: reference
native: CAAnimation.repeatCount
---

# `CAAnimation`：`repeatCount` 属性

**`repeatCount`** 属性是动画重复播放的次数。

## 值

数，没有单位，是次数。

- 可读，可写。
- 默认值是 `0`。
- 0 和 1 都是播一遍。
- 可以是小数：2.5 表示播两遍半。
- `Infinity` 表示一直重复。一直重复的动画不会自己结束，要停下来调图层的 `removeAnimationForKey()`。
- 和 [`repeatDuration`](repeatduration.md) 二选一。

### 写错时

按 `Number()` 转换。转换结果不是有限数、也不是 `Infinity` 时抛 `TypeError`：`repeatCount must be a finite number, got …`。

## 示例

```js
const layer = new CALayer();
const pulse = CABasicAnimation.animationWithKeyPath('opacity');
pulse.fromValue = 1;
pulse.toValue = 0.2;
pulse.duration = 0.7;
pulse.autoreverses = true;
pulse.repeatCount = Infinity;
layer.addAnimation(pulse, { forKey: 'pulse' });
console.log(pulse.repeatCount);
```

**效果**：图层在 0.7 秒里变淡，再用 0.7 秒变回来，一直重复。控制台输出 `Infinity`。

## 对应的 iOS API

`CAMediaTiming.repeatCount`。`HUGE_VALF` 写成 `Infinity`。

## 参见

- [`autoreverses`](autoreverses.md)：来回播放
- [`repeatDuration`](repeatduration.md)：按总时长重复
