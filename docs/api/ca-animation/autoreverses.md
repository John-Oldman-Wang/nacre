---
type: reference
native: CAAnimation.autoreverses
---

# `CAAnimation`：`autoreverses` 属性

**`autoreverses`** 属性决定动画播到终点后，是否倒着播回起点。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 播到终点后倒着播回起点。一遍的时长是 [`duration`](duration.md) 的两倍 |
| `false` | 到终点就结束 |

- 可读，可写。
- 默认值是 `false`。
- 写入时按 `Boolean()` 转换，不会出错。

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
```

**效果**：图层在 0.7 秒里变淡，再用 0.7 秒变回来，一直重复。

## 对应的 iOS API

`CAMediaTiming.autoreverses`。

## 参见

- [`repeatCount`](repeatcount.md)：重复次数
