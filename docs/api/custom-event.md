---
type: reference
web: CustomEvent
---

# `CustomEvent`

**`CustomEvent`** 表示一次带着一份自定义数据的事件。数据放在 [`detail`](custom-event/detail.md) 里。

[原生模块](native-module.md)发来的事件都是它，`detail` 是原生给的那份数据。App 自己也可以在任何 [`EventTarget`](event-target.md) 上派发一个 `CustomEvent`，把数据交给监听器。

**继承关系**：[`Event`](event.md) → `CustomEvent`

## 构造函数

[`CustomEvent()`](custom-event/constructor.md)

创建一个 `CustomEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`detail`](custom-event/detail.md) <small>只读</small> | 事件带的数据 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`NativeModule`](native-module.md) | 模块的 [`events`](native-module/events.md) 里列的全部事件 |

原生模块发来的事件不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const example = application.nativeModules.get('example');
example.addEventListener('tick', (e) => {
  console.log(e instanceof CustomEvent, JSON.stringify(e.detail));
});
example.call('emit', 'tick', { n: 1 });
```

**效果**：`example` 模块发出 `tick` 之后，控制台输出 `true {"n":1}`。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `CustomEvent`。原生模块在原生那一侧用 `emitEvent:detail:` 发事件，`detail` 就是这里的 [`detail`](custom-event/detail.md)。

## 参见

- [`NativeModule`](native-module.md)：发这种事件的对象
- [`addEventListener()`](native-module/addeventlistener.md)：监听原生模块的事件
- [`Event`](event.md)：基类
