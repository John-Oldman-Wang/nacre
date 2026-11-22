---
type: reference
native: CLLocationErrorEvent.error
---

# `CLLocationErrorEvent`：`error` 属性

**`error`** 属性是定位出的错。

## 值

[`CLLocationError`](../cl-location-error.md)：一个 [`DOMException`](../dom-exception.md) 或 [`NSError`](../ns-error.md)。`name` 是错误的分类。

- 只读。给它赋值抛 `TypeError`。
- 没有授权时 `name` 是 `'NotAllowedError'`。
- 暂时定不出位置时 `name` 是 `'LocationUnknownError'`，系统会接着试。
- 系统给的错误码和错误域：`NSError` 是它自己的 `code` 和 `domain`，`DOMException` 在 `cause` 上。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const manager = new CLLocationManager();
manager.addEventListener('locationerror', (e) => {
  if (e.error.name === 'NotAllowedError') {
    manager.stopUpdatingLocation();
    console.log('没有权限，停止定位');
  }
});
manager.startUpdatingLocation();
```

**效果**：没有定位权限时，停止定位并输出 `没有权限，停止定位`。**未在模拟器验证。**

## 对应的 iOS API

`locationManager:didFailWithError:` 的参数 `error`。

## 参见

- [`CLLocationErrorEvent`](../cl-location-error-event.md)
