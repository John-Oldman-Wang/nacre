---
type: reference
native: CLLocation.coordinate
---

# `CLLocation`：`coordinate` 属性

**`coordinate`** 属性是这个位置的经纬度。

## 值

[`CLLocationCoordinate2D`](../cl-location-coordinate-2d.md)，单位是度。

- 只读。给它赋值抛 `TypeError`：`coordinate is read-only: locations are values, they cannot be changed`。
- 总是有值，不会是 `null`。
- [`horizontalAccuracy`](horizontalaccuracy.md) 是 `null` 时，这个经纬度无效，不要用。
- 同一个 `CLLocation` 上每次读得到同一个对象。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.horizontalAccuracy !== null) {
    console.log(here.coordinate.latitude.toFixed(5), here.coordinate.longitude.toFixed(5));
  }
}, () => {});
```

**效果**：取到有效的位置时输出纬度和经度，各保留五位小数。

## 对应的 iOS API

`CLLocation.coordinate`。

## 参见

- [`CLLocationCoordinate2D`](../cl-location-coordinate-2d.md)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
