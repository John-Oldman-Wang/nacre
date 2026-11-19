---
type: reference
native: CAAnimation.repeatDuration
---

# `CAAnimation`：`repeatDuration` 属性

**`repeatDuration`** 属性是动画重复播放的总时长。在这段时间里动画反复播放，到时间就结束。

## 值

数，单位是秒。

- 可读，可写。
- 默认值是 `0`。
- 可以是 `Infinity`。
- 和 [`repeatCount`](repeatcount.md) 二选一。
- 效果**未在模拟器验证**。

### 写错时

按 `Number()` 转换。转换结果不是有限数、也不是 `Infinity` 时抛 `TypeError`：`repeatDuration must be a finite number, got …`。

## 示例

```js
const blink = CABasicAnimation.animationWithKeyPath('opacity');
blink.fromValue = 1;
blink.toValue = 0;
blink.duration = 0.5;
blink.repeatDuration = 3;
```

**效果**：加到图层上之后，0.5 秒一遍的淡出反复播放，共 3 秒。**未在模拟器验证。**

## 对应的 iOS API

`CAMediaTiming.repeatDuration`。

## 参见

- [`repeatCount`](repeatcount.md)：按次数重复
