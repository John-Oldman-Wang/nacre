---
type: reference
---

# `clearInterval()` 全局函数

**`clearInterval()`** 全局函数取消一个定时器。它和 [`clearTimeout()`](cleartimeout.md) 可以互换：`clearTimeout()` 能取消 `setInterval()` 建的定时器，反过来也一样。

## 语法

```
clearInterval(id)
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
let count = 0;
const id = setInterval(() => {
  count += 1;
  console.log('第 ' + count + ' 次');
  if (count >= 3) clearInterval(id);
}, 100);
```

**结果**：输出 `第 1 次`、`第 2 次`、`第 3 次`，然后停止。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`setInterval()`](setinterval.md)
- [`clearTimeout()`](cleartimeout.md)
