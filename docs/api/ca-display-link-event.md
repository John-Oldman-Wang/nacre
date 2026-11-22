---
type: reference
native: CADisplayLinkEvent
---

# `CADisplayLinkEvent`

**`CADisplayLinkEvent`** 表示屏幕刷新的一帧。

[`CADisplayLink`](ca-display-link.md) 的 [`tick`](ca-display-link/tick-event.md) 事件是它，[`frame`](ca-display-link-event/frame.md) 带着这一帧的三个时间。

**继承关系**：[`Event`](event.md) → `CADisplayLinkEvent`

## 构造函数

[`CADisplayLinkEvent()`](ca-display-link-event/constructor.md)

创建一个 `CADisplayLinkEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`frame`](ca-display-link-event/frame.md) <small>只读</small> | 这一帧的三个时间 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`CADisplayLink`](ca-display-link.md) | [`tick`](ca-display-link/tick-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const link = new CADisplayLink();
link.addEventListener('tick', (e) => {
  console.log(e instanceof CADisplayLinkEvent, e.frame.duration);
});
link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**效果**：每一帧输出 `true` 和两帧之间的间隔，比如 120 Hz 的屏幕上约是 `0.0083`。

## 对应的 iOS API

原生的回调方法收到 `CADisplayLink` 本身，从它上面读时间。这里是这一帧的值，在事件对象上。

| ObjC | JS |
| --- | --- |
| `link.timestamp` | `event.frame.timestamp` |
| `link.duration` | `event.frame.duration` |
| `link.targetTimestamp` | `event.frame.targetTimestamp` |

## 参见

- [`CADisplayLink`](ca-display-link.md)：派发这个事件的对象
- [每一帧执行一次代码](../guides/frame-callback.md)
