---
type: reference
native: "-[CLLocationManager stopUpdatingLocation]"
---

# `CLLocationManager`：`stopUpdatingLocation()` 方法

**`stopUpdatingLocation()`** 方法停止连续更新，并取消还没结算的 [`requestLocation()`](requestlocation.md)。

## 语法

```
stopUpdatingLocation()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。没在更新时调用不报错。

## 说明

- 调用之后不再派发 [`locationupdate`](locationupdate-event.md)。**未在模拟器验证。**
- 还没结算的 `requestLocation()` 被拒绝，`name` 是 `'AbortError'`。
- 运行时不再因为连续更新而保留这个 `manager`。
- 离开用到位置的页面时调它，不调的话定位一直开着。

## 示例

```js
const manager = new CLLocationManager();
const pending = manager.requestLocation();
manager.stopUpdatingLocation();
pending.catch((err) => {
  console.log(err.name);
});
```

**结果**：已经授权时输出 `AbortError`。没有授权时 `requestLocation()` 当场拒绝，输出 `NotAllowedError`。

## 对应的 iOS API

`-[CLLocationManager stopUpdatingLocation]`。

## 参见

- [`startUpdatingLocation()`](startupdatinglocation.md)：开始连续更新
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
