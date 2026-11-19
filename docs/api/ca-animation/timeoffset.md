---
type: reference
native: CAAnimation.timeOffset
---

# `CAAnimation`：`timeOffset` 属性

**`timeOffset`** 属性指定从动画的第几秒开始播。

## 值

数，单位是秒。

- 可读，可写。
- 默认值是 `0`。
- 效果**未在模拟器验证**。

### 写错时

按 `Number()` 转换。转换结果不是有限数时抛 `TypeError`：`timeOffset must be a finite number, got …`。

## 示例

```js
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 1;
fade.timeOffset = 0.5;
```

**效果**：加到图层上之后，从淡出的一半开始播。**未在模拟器验证。**

## 对应的 iOS API

`CAMediaTiming.timeOffset`。

## 参见

- [`speed`](speed.md)
