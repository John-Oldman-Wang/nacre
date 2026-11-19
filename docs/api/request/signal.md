---
type: reference
web: Request.signal
---

# `Request`：`signal` 属性

**`signal`** 属性是用来取消这次请求的 [`AbortSignal`](../abort-signal.md)。

## 值

[`AbortSignal`](../abort-signal.md)。

- 只读。给它赋值抛 `TypeError`。
- 构造时给了 `signal`，就是那一个对象。
- 构造时没给，是一个不会被取消的 `AbortSignal`，每次读是同一个对象。
- 把这个 `Request` 交给 `fetch()` 后，`signal` 一取消，请求就被取消。

## 示例

```js
const controller = new AbortController();
const req = new Request('https://httpbin.org/get', { signal: controller.signal });
console.log(req.signal === controller.signal);
```

**结果**：输出 `true`。

## 和 Web 的差别

Web 里 `req.signal` 是另建的一个跟着构造时那个信号的对象，`req.signal === controller.signal` 是 `false`。Nacre 里就是构造时给的那一个，是 `true`。

## 参见

- [`AbortController`](../abort-controller.md)
