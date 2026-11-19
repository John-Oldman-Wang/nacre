---
type: reference
native: CLLocation.speed
---

# `CLLocation`：`speed` 属性

**`speed`** 属性是设备移动的速度。

## 值

数（米每秒），或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 不小于 0。
- 系统量不出速度时是 `null`，这时 [`speedAccuracy`](speedaccuracy.md) 也是 `null`。

## 示例

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  if (latest.speed !== null) {
    console.log((latest.speed * 3.6).toFixed(1) + ' km/h');
  }
});
manager.startUpdatingLocation();
```

**效果**：每次有新位置、并且量出了速度时，输出换算成千米每小时的速度。**未在模拟器验证。**

## 对应的 iOS API

`CLLocation.speed`。ObjC 里无效时是负数，这里是 `null`。

## 参见

- [`course`](course.md)：移动的方向
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
