---
type: reference
web: AbortSignal.timeout()
---

# `AbortSignal.timeout()` 静态方法

**`AbortSignal.timeout()`** 静态方法返回一个过了指定时间自动取消的 `AbortSignal`。给请求设超时用它。

## 语法

```
AbortSignal.timeout(ms)
```

### 参数

**`ms`**

多少毫秒之后取消，数。按 `Number()` 转换；转换结果不是数时按 0 处理。

### 返回值

新的 `AbortSignal`。到时间时取消，[`reason`](reason.md) 是一个 `name` 为 `'TimeoutError'`、`message` 为 `The operation timed out` 的 `Error`。

### 异常

无。

## 说明

- 计时从调用 `AbortSignal.timeout()` 的那一刻开始，不是从发请求开始。
- 时间包括下载内容的时间：`fetch()` 已经返回、内容还没读完时到了时间，读取内容的那一步被拒绝。
- 请求被它取消时，`fetch()` 抛出的异常的 `name` 是 `'AbortError'`，不是 `'TimeoutError'`，和手动取消得到的异常相同。

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

## 和 Web 的差别

- 到时间后 `fetch()` 抛出 `AbortError`。Web 里抛出 `TimeoutError`。
- `reason` 是 `name` 为 `'TimeoutError'` 的 `Error`。Web 里是 `DOMException`。
- `ms` 转换结果不是数时按 0 处理。Web 里抛 `TypeError`。**来自代码，未在模拟器验证。**

## 参见

- [`AbortSignal.abort()`](abort.md)
- [定时器](../timers.md)
