---
type: reference
web: AbortController()
---

# `AbortController()` 构造函数

**`AbortController()`** 构造函数创建一个控制器，同时创建它的 [`signal`](signal.md)。

## 语法

```
new AbortController()
```

### 参数

无。

### 返回值

新建的 `AbortController`。它的 `signal` 还没有取消。

### 异常

无。

## 示例

```js
const controller = new AbortController();
console.log(controller.signal.aborted);
```

**结果**：输出 `false`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`abort()`](abort.md)
