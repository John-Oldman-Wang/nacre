---
type: reference
native: "-[CLLocationManager startUpdatingLocation]"
---

# `CLLocationManager`：`startUpdatingLocation()` 方法

**`startUpdatingLocation()`** 方法开始连续更新：之后每次有新位置，派发一次 [`locationupdate`](locationupdate-event.md)，直到调 [`stopUpdatingLocation()`](stopupdatinglocation.md)。

## 语法

```
startUpdatingLocation()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。没有授权时也不抛：系统从 [`locationerror`](locationerror-event.md) 事件报告，`name` 是 `'NotAllowedError'`，收不到位置。**没有授权时的这条事件未在模拟器验证。**

## 说明

- 已经在更新时再调一次没有额外的效果。
- 还没结算的 [`requestLocation()`](requestlocation.md) 被取消，Promise 被拒绝，`name` 是 `'AbortError'`。
- 从开始到停止，运行时保留这个 `manager`，不用自己留变量指着它。
- 定位硬件一直开着，直到调 `stopUpdatingLocation()`，期间一直耗电。
- 开始之后收到的第一个位置可能是系统以前存下的，不是刚量的。在意新旧时看位置的 [`timestamp`](../cl-location/timestamp.md)。

## 示例

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.coordinate.latitude, latest.coordinate.longitude);
});
manager.startUpdatingLocation();
```

**效果**：已经授权、并且系统有位置时，每次有新位置输出一行纬度和经度。位置多久来一次**未在模拟器验证**。

## 对应的 iOS API

`-[CLLocationManager startUpdatingLocation]`。位置从 `locationupdate` 事件来，不用设委托。

## 参见

- [`stopUpdatingLocation()`](stopupdatinglocation.md)：停下
- [`distanceFilter`](distancefilter.md)：移动多远才报一次
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
