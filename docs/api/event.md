---
type: reference
native: Event
status: partial
---

# `Event`

**`Event`** 表示一次事件：发生了什么（事件名）、派发给了谁、能不能取消。它是所有事件对象的基类，监听器收到的就是它或它的子类。它由运行时提供，是全局的类，可以用 `new Event(type, { cancelable })` 自己构造，再用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发。

子类在它的基础上多带一些字段，比如 [`ErrorEvent`](error-event.md)、[`PromiseRejectionEvent`](promise-rejection-event.md)、[`OpenURLEvent`](open-url-event.md)。

**继承关系**：`Event`

## 构造函数

[`Event()`](event/constructor.md)

创建一个事件对象。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`type`](event/type.md) <small>只读</small> | 事件名 |
| [`cancelable`](event/cancelable.md) <small>只读</small> | `preventDefault()` 有没有效果 |
| [`target`](event/target.md) <small>只读</small> | 事件派发到的对象 |
| [`currentTarget`](event/currenttarget.md) <small>只读</small> | 和 `target` 相同，因为没有冒泡 |
| [`defaultPrevented`](event/defaultprevented.md) <small>只读</small> | 有没有监听器调过 `preventDefault()` 并且生效了 |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`preventDefault()`](event/preventdefault.md) | 取消事件的默认动作 |
| [`stopImmediatePropagation()`](event/stopimmediatepropagation.md) | 同一个对象上排在后面的监听器不再执行 |
| [`stopPropagation()`](event/stoppropagation.md) | 什么都不做，因为没有冒泡 |

## 系统派发的事件不能取消

系统派发的事件，`cancelable` 一律是 `false`：回调执行时事情已经发生，`preventDefault()` 不起作用。例外是系统当场来问、要立刻给答案的事件，各在自己的页面上写明。`application` 的 `error` 和 `unhandledrejection` 的 `cancelable` 是 `true`。

## 示例

```js
application.addEventListener('beforelogout', (e) => {
  console.log(e.type, e.cancelable, e.target === application);
  e.preventDefault();
});

const event = new Event('beforelogout', { cancelable: true });
application.dispatchEvent(event);
console.log(event.defaultPrevented);
```

**结果**：依次输出 `beforelogout true true` 和 `true`。

## 参见

- [`EventTarget`](event-target.md)
