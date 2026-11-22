---
type: reference
native: CAAnimationEvent
---

# `CAAnimationEvent`

**`CAAnimationEvent`** 表示一段动画停了：播放到了结尾，或者中途被移除。

[`CAAnimation`](ca-animation.md) 的 [`stop`](ca-animation/stop-event.md) 事件是它，[`finished`](ca-animation-event/finished.md) 说明是哪一种。`start` 事件是普通的 [`Event`](event.md)。

**继承关系**：[`Event`](event.md) → `CAAnimationEvent`

## 构造函数

[`CAAnimationEvent()`](ca-animation-event/constructor.md)

创建一个 `CAAnimationEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`finished`](ca-animation-event/finished.md) <small>只读</small> | 动画是播放到了结尾，还是中途被移除 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`CAAnimation`](ca-animation.md) 和它的子类 | [`stop`](ca-animation/stop-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const dot = new CALayer();
const fade = CABasicAnimation.animationWithKeyPath('opacity');
fade.duration = 0.3;
fade.addEventListener('stop', (e) => {
  console.log(e instanceof CAAnimationEvent, e.finished);
});
dot.addAnimation(fade, { forKey: 'fade' });
```

**效果**：动画播放完时输出 `true true`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `animationDidStop:finished:` | `stop` 事件 |
| 参数 `flag` | `event.finished` |

## 参见

- [`CAAnimation`](ca-animation.md)：派发这个事件的对象
- [`stop`](ca-animation/stop-event.md)：什么时候派发
