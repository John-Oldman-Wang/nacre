---
type: reference
native: NSError.code
---

# `CLLocationError`：`code` 属性

**`code`** 属性是一个错误码。它是哪种码，看错误是 [`DOMException`](../dom-exception.md) 还是 [`NSError`](../ns-error.md)。

## 值

数。只读，给它赋值抛 `TypeError`。

| `name` | 是哪种错误 | `code` |
| --- | --- | --- |
| `'NotAllowedError'` | `DOMException` | 0：Web 的老数字码，这个名字没有 |
| `'NetworkError'` | `DOMException` | 19：Web 的老数字码 |
| `'AbortError'` | `DOMException` | 20：Web 的老数字码 |
| `'InvalidStateError'` | `DOMException` | 11：Web 的老数字码 |
| `'LocationUnknownError'` | `NSError` | 系统的错误码，是 0 |
| `'NSError'` | `NSError` | 系统的错误码 |

`DOMException` 的系统错误码在 `cause.code` 上：没有授权是 1，网络问题是 2。运行时自己给的 `'AbortError'` 和 `'InvalidStateError'` 没有 `cause`。

按 [`name`](name.md) 区分错误，不要只看 `code`。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  const systemCode = err instanceof NSError ? err.code : err.cause?.code;
  console.log(err.name, err.code, systemCode);
});
```

**结果**：没有授权时输出 `NotAllowedError 0 1`。`0` 是 `DOMException` 的 `code`，`1` 是系统的错误码。

## 对应的 iOS API

`NSError.code`，`CLError` 枚举里的值。`DOMException` 那几种在 `cause.code` 上。

## 参见

- [`name`](name.md)：错误的分类。区分错误用它
- [`DOMException` 的 `code`](../dom-exception/code.md)：Web 的老数字码
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
