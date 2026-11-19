---
type: reference
---

# `clearTimeout()` 全局函数

**`clearTimeout()`** 全局函数取消一个定时器。它和 [`clearInterval()`](clearinterval.md) 可以互换：`clearTimeout()` 能取消 `setInterval()` 建的定时器，反过来也一样。

## 语法

```
clearTimeout(id)
```

### 参数

**`id`**

[`setTimeout()`](settimeout.md) 或 [`setInterval()`](setinterval.md) 返回的编号。

### 返回值

无（`undefined`）。

### 异常

无。编号不存在、定时器已经执行过或已经取消过、不传参数或传 `null`，都不报错，什么也不做。

## 说明

在 `setInterval()` 的回调里取消它自己，这一次回调照常执行完，之后不再执行。

## 示例

```js
const id = setTimeout(() => {
  console.log('不会输出');
}, 1000);

clearTimeout(id);
clearTimeout(id);
```

**结果**：没有任何输出。第二次取消同一个编号不报错。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`setTimeout()`](settimeout.md)
- [`clearInterval()`](clearinterval.md)
