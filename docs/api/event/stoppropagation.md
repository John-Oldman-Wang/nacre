---
type: reference
native: Event.stopPropagation
---

# `Event`：`stopPropagation()` 方法

**`stopPropagation()`** 方法什么都不做。事件没有冒泡，没有可以停止的传播。保留它是为了和浏览器的写法兼容。

## 语法

```
stopPropagation()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
application.addEventListener('ping', (e) => e.stopPropagation());
application.addEventListener('ping', () => console.log('照常执行'));
application.dispatchEvent(new Event('ping'));
```

**结果**：输出 `照常执行`。**未在模拟器验证。**

## 参见

- [`stopImmediatePropagation()`](stopimmediatepropagation.md)：要让后面的监听器不执行，用它
