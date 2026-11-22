---
type: reference
native: "-[CAAnimationDelegate animationDidStart:]"
---

# `CAAnimation`：`start` 事件

**`start`** 事件在动画开始播放时派发。

## 语法

```
animation.addEventListener('start', (event) => { })
```

## 事件对象

普通的 [`Event`](../event.md)，除 `type`、`target` 外不带别的字段。

- `target` 是代码创建的那个动画对象，不是图层上保存的副本。
- 不能取消。

## 什么时候派发

- 动画在屏幕上开始播放时。这不是调 `addAnimation()` 的那一刻：当前这段 JS 代码执行完、界面的修改交给系统之后，动画才开始，见[加到图层上之后](../ca-animation.md#加到图层上之后)。
- 回调不是在动画开始的那一刻同步执行的，见[运行时怎么工作](../how-it-works.md)。
- 监听器要在 `addAnimation()` 之前加，并且加在代码创建的那个对象上。
- 放在 [`CAAnimationGroup`](../ca-animation-group.md) 里的成员是否派发，**未在模拟器验证**。

类型定义里，动画对象的 `addEventListener()` 只接受 `'start'` 和 `'stop'`。运行时监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 示例

```js
const layer = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.fromValue = 1;
fade.toValue = 0;
fade.duration = 0.3;
fade.addEventListener('start', () => {
  console.log('开始了');
});
layer.addAnimation(fade, { forKey: 'fade' });
```

**效果**：图层显示在屏幕上时，动画开始播放，控制台输出 `开始了`。

## 对应的 iOS API

`-[CAAnimationDelegate animationDidStart:]`。不用设 `delegate`，直接在动画对象上监听。

## 参见

- [`stop`](stop-event.md)：动画结束
