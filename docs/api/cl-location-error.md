---
type: reference
native: NSError (kCLErrorDomain)
---

# `CLLocationError`

**`CLLocationError`** 是定位出错时得到的错误。[`requestLocation()`](cl-location-manager/requestlocation.md) 和 [`requestWhenInUseAuthorization()`](cl-location-manager/requestwheninuseauthorization.md) 的 Promise 被拒绝时得到它，[`locationerror`](cl-location-manager/locationerror-event.md) 事件的 `error` 字段也是它。

`CLLocationError` 是类型定义里的名字，不是全局上的类：全局没有 `CLLocationError`，不能用 `instanceof CLLocationError` 判断。它是下面两种错误之一，用 `name` 区分是哪一种：

| `name` | 是哪种错误 | 系统的错误码和错误域在哪 |
| --- | --- | --- |
| `'NotAllowedError'`、`'NetworkError'`、`'AbortError'`、`'InvalidStateError'` | [`DOMException`](dom-exception.md) | `cause` 上，是一个 [`NSError`](ns-error.md)。`'AbortError'` 和 `'InvalidStateError'` 由运行时给出，没有 `cause` |
| `'LocationUnknownError'`、`'NSError'` | [`NSError`](ns-error.md) | 它自己的 `code` 和 `domain` |

两种都是 `Error`，`err instanceof Error` 是 `true`。

要先装 `@nacrejs/core-location`，装法见 [`CLLocationManager`](cl-location-manager.md#先装上)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`Error` → [`DOMException`](dom-exception.md) 或 [`NSError`](ns-error.md)

## 构造函数

不能创建。错误由运行时在定位出错时给出。

## 实例属性

还有 `Error` 的 `message`：一句说明。系统给的错误是系统的文字，跟随系统语言。

| 属性 | 说明 |
| --- | --- |
| [`name`](cl-location-error/name.md) | 错误的分类，比如 `'NotAllowedError'` |
| [`code`](cl-location-error/code.md) | `DOMException` 是 Web 的老数字码，`NSError` 是系统的错误码 |
| [`domain`](cl-location-error/domain.md) | 只有 `NSError` 有：系统的错误域 |

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  const system = err instanceof NSError ? err : err.cause;
  console.log(err.name, system?.domain, system?.code);
});
```

**结果**：没有授权时输出 `NotAllowedError kCLErrorDomain 1`（实测）。

## 对应的 iOS API

`NSError`，错误域是 `kCLErrorDomain`。`error.code == kCLErrorDenied` 写成 `error.name === 'NotAllowedError'`，这时系统的 `NSError` 在 `error.cause` 上。

## 参见

- [`CLLocationManager`](cl-location-manager.md)：哪些方法和事件会给出它
- [`DOMException`](dom-exception.md)、[`NSError`](ns-error.md)：这两种错误的全部成员
- [取用户的位置](../guides/get-location.md#处理出错)：出错之后该怎么办
