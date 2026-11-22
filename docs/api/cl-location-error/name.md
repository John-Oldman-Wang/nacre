---
type: reference
native: NSError.code (kCLErrorDomain)
---

# `CLLocationError`：`name` 属性

**`name`** 属性是定位错误的分类。按它判断出了什么错。

## 值

字符串，下面六个之一：

| 取值 | 含义 | 谁给出的 | 是哪种错误 |
| --- | --- | --- | --- |
| `'NotAllowedError'` | 没有授权 | 系统，或者运行时在调用系统之前判断出来。两种情况都带 `cause`：`cause.code` 是 1，`cause.domain` 是 `'kCLErrorDomain'` | [`DOMException`](../dom-exception.md) |
| `'NetworkError'` | 网络问题 | 系统（`cause.code` 是 2） | `DOMException` |
| `'AbortError'` | [`requestLocation()`](../cl-location-manager/requestlocation.md) 被取消 | 运行时，没有 `cause` | `DOMException` |
| `'InvalidStateError'` | 现在不能做这件事：正在连续更新时取一次、App 在后台时申请授权、Info.plist 里没有那句说明 | 运行时，没有 `cause` | `DOMException` |
| `'LocationUnknownError'` | 这一刻定不出位置。连续更新时系统会接着试 | 系统（`code` 是 0） | [`NSError`](../ns-error.md) |
| `'NSError'` | 系统报告的其他错误，看 [`code`](code.md) 和 [`domain`](domain.md) | 系统 | `NSError` |

- 系统给的错误里，错误域不是 `kCLErrorDomain` 的也归为 `'NSError'`。
- 只读。给它赋值抛 `TypeError`。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().catch((err) => {
  if (err.name === 'NotAllowedError') {
    console.log('没有权限');
  } else {
    console.log('别的错误：' + err.name);
  }
});
```

**效果**：没有授权时输出 `没有权限`。

## 对应的 iOS API

没有直接对应：ObjC 里看 `NSError.code`。`kCLErrorDenied` 是 `'NotAllowedError'`，`kCLErrorLocationUnknown` 是 `'LocationUnknownError'`，`kCLErrorNetwork` 是 `'NetworkError'`。

## 参见

- [`code`](code.md)：错误码
- [`DOMException`](../dom-exception.md)、[`NSError`](../ns-error.md)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
