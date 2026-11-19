---
type: reference
native: EventTarget
status: partial
---

# `EventTarget`

**`EventTarget`** 表示能派发事件、能被监听事件的对象。它是所有会发事件的对象的基类：[`application`](application.md)、场景、窗口、视图、控件等全部原生类都继承它。它由运行时提供，是全局的类，可以直接 `new`。

事件模型只有三条：

- 事件只派发给注册了监听器的那个对象，没有捕获和冒泡。
- [`addEventListener()`](event-target/addeventlistener.md) 的选项只有 `once`。
- 监听器只能是函数。

**继承关系**：`EventTarget`

## 构造函数

[`EventTarget()`](event-target/constructor.md)

创建一个独立的事件目标，用来在 App 自己的代码之间派发事件。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`addEventListener()`](event-target/addeventlistener.md) | 注册监听器 |
| [`removeEventListener()`](event-target/removeeventlistener.md) | 移除监听器 |
| [`dispatchEvent()`](event-target/dispatchevent.md) | 同步派发一个事件 |

## 示例

```js
const bus = new EventTarget();
bus.addEventListener('login', (e) => {
  console.log('收到', e.type);
});
bus.dispatchEvent(new Event('login'));
```

**结果**：`dispatchEvent()` 返回之前，控制台输出 `收到 login`。

## 与浏览器的对照

| 浏览器 | Nacre |
| --- | --- |
| `addEventListener()` 的 `capture`、`passive`、`signal` 选项 | 没有。只有 `once` |
| 监听器可以是带 `handleEvent()` 的对象 | 不可以。只能是函数 |
| 捕获和冒泡 | 没有。事件只派发给目标自己 |

## 参见

- [`Event`](event.md)：事件对象
- [`Application`](application.md)：最常用的事件目标
- [运行时怎么工作](how-it-works.md#事件)：原生事件什么时候派发
- [实现原理：事件](../internals/events.md)
