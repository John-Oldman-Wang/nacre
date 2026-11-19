---
type: reference
native: EventTarget.addEventListener
---

# `EventTarget`：`addEventListener()` 方法

**`addEventListener()`** 方法注册一个监听器：这个对象上派发某个名字的事件时，调用它。

## 语法

```
addEventListener(type, callback)
addEventListener(type, callback, { once })
```

### 参数

**`type`**

事件名，字符串。系统派发的事件名见各个类的「事件」一节；也可以是自己定的名字。监听不认识的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

**`callback`**

函数，收到事件对象。传 `null` 时什么都不做。

**`options.once`**

布尔值，可选。`true` 表示触发一次后自动移除。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 少传参数：`Failed to execute 'addEventListener': 2 arguments required.`
- `callback` 不是函数：`Failed to execute 'addEventListener': parameter 2 is not of type 'Function'.`

## 说明

- 同一个事件名下，同一个函数重复注册只算一次（实测）。
- 原生事件的回调不是在事情发生的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。
- 监听器抛出的异常不影响同一个事件的其余监听器，运行时在 `application` 上派发 [`error`](../application/error-event.md)。

## 示例

```js
application.addEventListener('memorywarning', () => {
  console.log('内存不足');
}, { once: true });
```

**效果**：第一次收到内存警告时输出 `内存不足`，之后不再输出。

## 对应的 iOS API

原生的 target-action、通知中心的 `addObserver:`、委托方法，在 JS 里都换成 `addEventListener()`。各个类页面的对照表里写了具体对应。

## 参见

- [`removeEventListener()`](removeeventlistener.md)
