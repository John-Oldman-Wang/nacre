---
type: reference
native: "-[CLLocationManagerDelegate locationManager:didFailWithError:]"
---

# `CLLocationManager`：`locationerror` 事件

**`locationerror`** 事件在定位出错时派发，主要在连续更新期间。

## 语法

```
manager.addEventListener('locationerror', (event) => { })
```

## 事件对象

[`CLLocationErrorEvent`](../cl-location-error-event.md)，多出一个字段：

**[`error`](../cl-location-error-event/error.md)**

[`CLLocationError`](../cl-location-error.md)，是 [`DOMException`](../dom-exception.md) 或 [`NSError`](../ns-error.md)。`name` 是错误的分类。系统给的错误码和错误域：`NSError` 是它自己的 `code` 和 `domain`，`DOMException` 在 `cause` 上。

事件不能取消。`target` 是这个 `manager`。

## 什么时候派发

- 系统报告定位出错时。连续更新期间没有授权，`name` 是 `'NotAllowedError'`；暂时定不出位置，`name` 是 `'LocationUnknownError'`，系统会接着试。
- 回调在系统报告之后的下一轮执行。

事件名是 `locationerror`，不是 `error`。监听 `error` 不报错，但收不到任何东西。

这个事件的实际派发**未在模拟器验证**。

## 示例

```js
const manager = new CLLocationManager();
manager.addEventListener('locationerror', (e) => {
  if (e.error.name === 'NotAllowedError') {
    manager.stopUpdatingLocation();
    console.log('没有权限，停止定位');
  } else {
    const system = e.error instanceof NSError ? e.error : e.error.cause;
    console.log('定位出错', e.error.name, system?.domain, system?.code);
  }
});
manager.startUpdatingLocation();
```

**效果**（未在模拟器验证）：没有授权时输出 `没有权限，停止定位`；别的错误输出错误的名字、系统的错误域和错误码。

## 对应的 iOS API

委托方法 `locationManager:didFailWithError:`。`NSError` 是事件的 `e.error`。

## 参见

- [`CLLocationError`](../cl-location-error.md)：每种 `name` 的含义
- [取用户的位置](../../guides/get-location.md#处理出错)：出错之后该停还是继续
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
