---
type: reference
native: CAAnimationEvent.finished
---

# `CAAnimationEvent`：`finished` 属性

**`finished`** 属性表示动画是播放到了结尾，还是中途被移除。

## 值

布尔值。

- 只读。给它赋值抛 `TypeError`。
- `true`：播放到了结尾。
- `false`：中途被移除，比如调了图层的 `removeAnimationForKey()`，或者同一个键上加了另一段动画。
- 这个事实只能从事件上得到，动画对象上读不出来。
- 用 [`new`](constructor.md) 创建时没给，是 `false`。

## 示例

```js
const dot = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
fade.addEventListener('stop', (e) => {
  if (e.finished) {
    dot.removeFromSuperlayer();
  }
});
dot.addAnimation(fade, { forKey: 'fade' });
```

**效果**：`dot` 淡出播放完之后，从父图层上移除。中途被打断时不移除。

## 对应的 iOS API

`animationDidStop:finished:` 的参数 `flag`。

## 参见

- [`CAAnimationEvent`](../ca-animation-event.md)
