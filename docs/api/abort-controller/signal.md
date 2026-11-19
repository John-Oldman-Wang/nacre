---
type: reference
web: AbortController.signal
---

# `AbortController`：`signal` 属性

**`signal`** 属性是这个控制器对应的 [`AbortSignal`](../abort-signal.md)。把它交给 `fetch()`，调 [`abort()`](abort.md) 时请求被取消。

## 值

[`AbortSignal`](../abort-signal.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读是同一个对象。

## 示例

```js
async function main() {
  const controller = new AbortController();
  const promise = fetch('https://httpbin.org/delay/5', { signal: controller.signal });
  setTimeout(() => controller.abort(), 200);
  try {
    await promise;
  } catch (err) {
    console.log(err instanceof Error ? err.name : err);
  }
}
main();
```

**结果**：200 毫秒后输出 `AbortError`。请求被真正取消，不再占用网络。

## 和 Web 的差别

和 Web 相同。

## 参见

- [`AbortSignal`](../abort-signal.md)
