---
type: reference
native: Event.stopImmediatePropagation
---

# `Event`：`stopImmediatePropagation()` 方法

**`stopImmediatePropagation()`** 方法让同一个对象上排在后面的监听器不再执行。

## 语法

```
stopImmediatePropagation()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
application.addEventListener('ping', (e) => {
  console.log('第一个');
  e.stopImmediatePropagation();
});
application.addEventListener('ping', () => {
  console.log('第二个');
});
application.dispatchEvent(new Event('ping'));
```

**结果**：只输出 `第一个`。**未在模拟器验证。**

## 参见

- [`stopPropagation()`](stoppropagation.md)
