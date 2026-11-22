---
type: reference
native: CLLocationUpdateEvent.locations
---

# `CLLocationUpdateEvent`：`locations` 属性

**`locations`** 属性是这一次报上来的位置。

## 值

[`CLLocation`](../cl-location.md) 的数组，至少一个。

- 只读。给它赋值抛 `TypeError`。
- 按时间从早到晚排，**最后一个是最新的**。
- 系统有时把几个位置一起报。
- 用 [`new`](constructor.md) 创建时没给，是 空数组。

## 示例

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.coordinate.latitude, latest.coordinate.longitude);
});
manager.startUpdatingLocation();
```

**效果**：每次有新位置，输出最新一个位置的纬度和经度。

## 对应的 iOS API

`locationManager:didUpdateLocations:` 的参数 `locations`。

## 参见

- [`CLLocationUpdateEvent`](../cl-location-update-event.md)
