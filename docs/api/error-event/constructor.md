---
type: reference
native: ErrorEvent()
---

# `ErrorEvent()` 构造函数

**`ErrorEvent()`** 构造函数创建一个错误事件对象。

## 语法

```
new ErrorEvent(type)
new ErrorEvent(type, { message, error, filename, lineno, cancelable })
```

### 参数

**`type`**

事件名，字符串。

**`options.message`**、**`options.error`**、**`options.filename`**、**`options.lineno`**

可选，对应同名的属性。不传时的值**未在模拟器验证**。

**`options.cancelable`**

布尔值，可选，默认 `false`。

### 返回值

新建的 `ErrorEvent`。

### 异常

没传事件名时抛 `TypeError`，和 [`Event()`](../event/constructor.md) 相同。**未在模拟器验证。**

## 示例

```js
const err = new Error('测试');
const event = new ErrorEvent('error', { message: err.message, error: err });
console.log(event.message, event.error === err);
```

**结果**：控制台输出 `测试 true`。**未在模拟器验证。**

## 对应的 iOS API

没有对应的系统 API。对应浏览器的 `new ErrorEvent()`。

## 参见

- [`ErrorEvent`](../error-event.md)
