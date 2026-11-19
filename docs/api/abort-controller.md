---
type: reference
web: AbortController
---

# `AbortController`

**`AbortController`** 表示一个取消指令的发出方。它的 [`signal`](abort-controller/signal.md) 交给 [`fetch()`](fetch.md) 或 [`Request`](request.md)，调 [`abort()`](abort-controller/abort.md) 时这些请求被取消。

一个 `signal` 可以交给多个请求，`abort()` 一次全部取消。已经完成的请求不受影响。取消之后不能恢复；要再发请求，新建一个 `AbortController`。

**继承关系**：`AbortController` 不继承其他类。

怎么取消请求、给请求设超时，见指南[从网络取数据](../guides/fetch.md#取消一个请求)。

## 构造函数

[`AbortController()`](abort-controller/constructor.md)

创建一个控制器和它的 `signal`。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`signal`](abort-controller/signal.md) <small>只读</small> | 对应的 [`AbortSignal`](abort-signal.md) |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`abort()`](abort-controller/abort.md) | 取消 |

## 示例

```js
const controller = new AbortController();
controller.signal.addEventListener('abort', () => {
  console.log('已取消');
});
controller.abort();
```

**结果**：输出 `已取消`。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`AbortSignal`](abort-signal.md)：取消的状态和原因
- [`fetch()`](fetch.md)
