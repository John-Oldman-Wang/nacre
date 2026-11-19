---
type: reference
native: EventTarget.dispatchEvent
---

# `EventTarget`：`dispatchEvent()` 方法

**`dispatchEvent()`** 方法同步派发一个事件：依次调用这个对象上这个事件名下的所有监听器，全部执行完才返回。

## 语法

```
dispatchEvent(event)
```

### 参数

**`event`**

[`Event`](../event.md) 或它的子类的实例。

### 返回值

布尔值。有监听器调了 `preventDefault()` 并且事件的 `cancelable` 是 `true` 时返回 `false`，其余情况返回 `true`（实测）。

### 异常

**`TypeError`**

参数不是 `Event`：`Failed to execute 'dispatchEvent': parameter 1 is not of type 'Event'.`

## 说明

- 一个监听器抛出异常，不影响后面的监听器，也不会从 `dispatchEvent()` 抛出来。运行时为它在 `application` 上派发 [`error`](../application/error-event.md)（实测）。
- 派发过程中被移除的监听器，如果还没轮到，这一次不再执行。派发过程中新加的监听器，这一次不执行，下一次派发才执行。这两条和浏览器一致。
- 自定义的事件名不要和系统派发的事件名相同。

## 示例

```js
application.addEventListener('beforelogout', (e) => {
  e.preventDefault();
});

const event = new Event('beforelogout', { cancelable: true });
const ok = application.dispatchEvent(event);
console.log(ok);
```

**结果**：控制台输出 `false`，表示有监听器调了 `preventDefault()`。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `dispatchEvent()`。

## 参见

- [`Event()`](../event/constructor.md)：构造要派发的事件
