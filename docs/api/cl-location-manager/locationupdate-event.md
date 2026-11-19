---
type: reference
native: "-[CLLocationManagerDelegate locationManager:didUpdateLocations:]"
---

# `CLLocationManager`：`locationupdate` 事件

**`locationupdate`** 事件在 `CLLocationManager` 有了新的位置时派发。

## 语法

```
manager.addEventListener('locationupdate', (event) => { })
```

## 事件对象

`CLLocationUpdateEvent`，多出一个字段：

**`locations`**

[`CLLocation`](../cl-location.md) 的数组，至少一个，按时间从早到晚，**最后一个是最新的**。系统有时把几个位置一起报。这个字段只读，给它赋值抛 `TypeError`。

事件不能取消。`target` 是这个 `manager`。

## 什么时候派发

- 连续更新期间（[`startUpdatingLocation()`](startupdatinglocation.md) 之后、[`stopUpdatingLocation()`](stopupdatinglocation.md) 之前），每次有新位置。
- [`requestLocation()`](requestlocation.md) 取到位置时。
- 回调在系统报告位置之后的下一轮执行。

## 示例

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.coordinate.latitude, latest.coordinate.longitude,
              latest.timestamp.toISOString());
});
manager.startUpdatingLocation();
```

**效果**：每次有新位置输出一行：纬度、经度、测量的时间。

## 对应的 iOS API

委托方法 `locationManager:didUpdateLocations:`。`locations` 参数是事件的 `e.locations`。

## 参见

- [`locationerror`](locationerror-event.md)：定位出错
- [取用户的位置](../../guides/get-location.md#挑出可用的位置)：按误差和时间挑出可用的位置
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
