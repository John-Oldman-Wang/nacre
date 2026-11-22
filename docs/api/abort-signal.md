---
type: reference
web: AbortSignal
---

# `AbortSignal`

**`AbortSignal`** 表示一个取消信号：有没有取消、为什么取消。把它交给 [`fetch()`](fetch.md) 的 `signal`，它一取消，请求就被取消。

`AbortSignal` 不能用 `new` 创建：`new AbortSignal()` 抛 `TypeError: AbortSignal cannot be constructed directly, use new AbortController()`。它从下面三处得到：

| 来源 | 得到什么 |
| --- | --- |
| [`controller.signal`](abort-controller/signal.md) | 由 `controller.abort()` 控制 |
| [`AbortSignal.timeout()`](abort-signal/timeout.md) | 过了指定的毫秒数自动取消 |
| [`AbortSignal.abort()`](abort-signal/abort.md) | 一个已经处于取消状态的信号 |

**继承关系**：`EventTarget` → `AbortSignal`

## 静态方法

[`AbortSignal.abort()`](abort-signal/abort.md)

返回一个已经取消的信号。

[`AbortSignal.timeout()`](abort-signal/timeout.md)

返回一个过了指定时间自动取消的信号。给请求设超时用它。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`aborted`](abort-signal/aborted.md) <small>只读</small> | 是否已经取消 |
| [`reason`](abort-signal/reason.md) <small>只读</small> | 取消的原因 |

## 实例方法

还继承 `EventTarget` 的 `addEventListener()`、`removeEventListener()`、`dispatchEvent()`。

| 方法 | 说明 |
| --- | --- |
| [`throwIfAborted()`](abort-signal/throwifaborted.md) | 已取消时抛出 `reason` |

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`abort`](abort-signal/abort-event.md) | 取消时派发一次 |

## 示例

```js
async function main() {
  try {
    await fetch('https://httpbin.org/delay/5', { signal: AbortSignal.timeout(300) });
  } catch (err) {
    console.log(err instanceof Error ? err.name : err);
  }
}
main();
```

**结果**：300 毫秒后请求被取消，输出 `AbortError`。

> **注意**：请求进行中被取消时，`fetch()` 和 `read()` 抛出的不是 `signal.reason`，而是一个新的 `AbortError`。所以 `AbortSignal.timeout()` 到时间后 `signal.reason.name` 是 `'TimeoutError'`，`fetch()` 抛出的异常的 `name` 是 `'AbortError'`。判断请求是否被取消，看异常的 `name` 是不是 `'AbortError'`。

## 和 Web 的差别

- 请求进行中被取消时，`fetch()` 抛出 `AbortError`，不是 `signal.reason`。
- 没有 `AbortSignal.any()`，没有 `onabort` 属性。

## 参见

- [`AbortController`](abort-controller.md)：发出取消指令
- [`fetch()`](fetch.md)
