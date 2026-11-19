---
type: reference
native: EventTarget.removeEventListener
---

# `EventTarget`：`removeEventListener()` 方法

**`removeEventListener()`** 方法移除用 [`addEventListener()`](addeventlistener.md) 注册的监听器。

## 语法

```
removeEventListener(type, callback)
```

### 参数

**`type`**

事件名，要和注册时相同。

**`callback`**

要和注册时是同一个函数。

### 返回值

无（`undefined`）。

### 异常

无。没注册过的函数不报错，什么都不做。

## 示例

```js
const onWarning = () => {
  console.log('内存不足');
};
application.addEventListener('memorywarning', onWarning);
application.removeEventListener('memorywarning', onWarning);
```

**效果**：之后收到内存警告时不输出。

## 对应的 iOS API

对应原生的 `removeTarget:action:` 和通知中心的 `removeObserver:`。

## 参见

- [`addEventListener()`](addeventlistener.md)
