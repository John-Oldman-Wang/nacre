---
type: reference
---

# `NativeModule`：`removeEventListener()` 方法

**`removeEventListener()`** 方法去掉用 [`addEventListener()`](addeventlistener.md) 加上的监听器。去掉之后，这个回调不再收到事件。

## 语法

```
removeEventListener(type, callback)
```

### 参数

**`type`**

事件名，字符串。

**`callback`**

当初传给 `addEventListener()` 的那个函数。没加过时什么都不发生。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

一个事件名的监听器全都去掉之后，原生那边不再把这个事件送过来；这期间发的事件不会保留，之后再加监听器也收不到。

## 示例

```js
const example = application.nativeModules.get('example');
/** @param {CustomEvent} e */
const onTick = (e) => {
  console.log('tick', e.detail);
};
example.addEventListener('tick', onTick);

setTimeout(() => {
  example.removeEventListener('tick', onTick);
}, 1000);
```

**效果**：一秒之后监听器被去掉，之后的 `tick` 事件不再有输出。

## 对应的 iOS API

没有对应的系统 API。

## 参见

- [`addEventListener()`](addeventlistener.md)
