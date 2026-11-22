---
type: reference
native: "-[CAAnimationDelegate animationDidStop:finished:]"
---

# `CAAnimation`：`stop` 事件

**`stop`** 事件在动画结束时派发。事件对象的 `finished` 区分动画是播放到了结尾，还是中途被移除。

## 语法

```
animation.addEventListener('stop', (event) => { })
```

## 事件对象

[`CAAnimationEvent`](../ca-animation-event.md)，除 `type`、`target` 外带一个字段：

**[`finished`](../ca-animation-event/finished.md)**

布尔。`true` 表示播放到了结尾；`false` 表示中途被移除，例如调了图层的 `removeAnimationForKey()`。这个事实只能从事件上得到，动画对象上读不出来。

- `target` 是代码创建的那个动画对象，不是图层上保存的副本。
- 不能取消。

## 什么时候派发

- 动画播完时，`finished` 是 `true`。
- 动画被 `removeAnimationForKey()` 移除时，`finished` 是 `false`。
- `repeatCount` 是 `Infinity` 的动画不会自己结束，只在被移除时派发。
- 回调不是在动画结束的那一刻同步执行的，见[运行时怎么工作](../how-it-works.md)。
- 监听器要在 `addAnimation()` 之前加，并且加在代码创建的那个对象上。
- 要知道整组何时结束，在 [`CAAnimationGroup`](../ca-animation-group.md) 上监听。组里的成员是否派发，**未在模拟器验证**。

类型定义里，动画对象的 `addEventListener()` 只接受 `'start'` 和 `'stop'`。运行时监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 示例

```js
const dot = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;

fade.addEventListener('stop', (ev) => {
  if (ev.finished) {
    dot.removeFromSuperlayer();
  }
});

dot.addAnimation(fade, { forKey: 'fade' });
```

**效果**：图层在 0.3 秒里消失，播完后从父图层上移除。只想在正常播完时执行的代码，要判断 `finished`。

## 对应的 iOS API

`-[CAAnimationDelegate animationDidStop:finished:]`。不用设 `delegate`，直接在动画对象上监听；`flag` 参数写成事件对象的 `finished`。

## 参见

- [`start`](start-event.md)：动画开始
- [动画结束后做下一件事](../../guides/animation.md#动画结束后做下一件事)
