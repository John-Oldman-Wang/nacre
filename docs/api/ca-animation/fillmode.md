---
type: reference
native: CAAnimation.fillMode
---

# `CAAnimation`：`fillMode` 属性

**`fillMode`** 属性决定动画的播放时段之外，屏幕上显示什么。「播放时段」指从动画开始到结束的这段时间。

## 值

字符串，下面四个之一：

| 取值 | 效果 |
| --- | --- |
| `'removed'` | 播放时段之外，显示属性的值 |
| `'forwards'` | 结束之后，继续显示终点值。要同时把 [`removedOnCompletion`](removedoncompletion.md) 设成 `false` 才有效 |
| `'backwards'` | 开始之前，就显示起点值。只在动画延迟开始时有区别 |
| `'both'` | 以上两者 |

- 可读，可写。
- 默认值是 `'removed'`。
- 四种取值在画面上的效果**未在模拟器验证**。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，`fillMode` 保持原来的值：

```
[Nacre] fillMode has no value "hold"; expected one of: removed / forwards / backwards / both, ignored
```

## 示例

```js
const layer = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
fade.fillMode = 'forwards';
fade.removedOnCompletion = false;
layer.addAnimation(fade, { forKey: 'fade' });
```

**效果**：图层在 0.3 秒里逐渐消失，之后保持不可见。`layer.opacity` 读出来仍然是 1。**未在模拟器验证。**

这种写法让动画一直留在图层上，代价见[让图层停在终点](../../guides/animation.md#让图层停在终点)。

## 对应的 iOS API

`CAMediaTiming.fillMode`。`kCAFillModeForwards` 写成 `'forwards'`，其余同理。

## 参见

- [`removedOnCompletion`](removedoncompletion.md)
- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常
