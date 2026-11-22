---
type: reference
native: NSError.domain
---

# `CLLocationError`：`domain` 属性

**`domain`** 属性是系统给的错误域。只有 [`NSError`](../ns-error.md) 那两种错误有它。

## 值

字符串。只读，给它赋值抛 `TypeError`。

- `name` 是 `'LocationUnknownError'` 或 `'NSError'` 时，错误是 `NSError`，`domain` 是系统的错误域。定位的错误是 `'kCLErrorDomain'`；`'NSError'` 也可能是别的错误域。
- `name` 是 `'NotAllowedError'`、`'NetworkError'`、`'AbortError'`、`'InvalidStateError'` 时，错误是 [`DOMException`](../dom-exception.md)，没有 `domain`。系统的错误域在 `cause.domain` 上；运行时自己给的 `'AbortError'` 和 `'InvalidStateError'` 没有 `cause`。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  const domain = err instanceof NSError ? err.domain : err.cause?.domain;
  console.log(domain === undefined ? '运行时给的' : '系统给的：' + domain);
});
```

**结果**：没有授权时输出 `系统给的：kCLErrorDomain`（实测）。

## 对应的 iOS API

`NSError.domain`。`DOMException` 那几种在 `cause.domain` 上。

## 参见

- [`code`](code.md)
- [`NSError` 的 `domain`](../ns-error/domain.md)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
