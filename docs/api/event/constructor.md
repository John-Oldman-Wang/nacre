---
type: reference
native: Event()
---

# `Event()` 构造函数

**`Event()`** 构造函数创建一个事件对象。

## 语法

```
new Event(type)
new Event(type, { cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.cancelable`**

布尔值，可选，默认 `false`。`true` 时监听器调 `preventDefault()` 有效。

### 返回值

新建的 `Event`。还没派发过，`target` 是 `null`。

### 异常

**`TypeError`**

没传事件名：`Failed to construct 'Event': 1 argument required, but only 0 present.`

## 示例

```js
const event = new Event('login');
console.log(event.type, event.cancelable, event.target);
```

**结果**：控制台输出 `login false null`。

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `new Event()`。

## 参见

- [`dispatchEvent()`](../event-target/dispatchevent.md)
