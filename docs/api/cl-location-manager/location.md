---
type: reference
native: CLLocationManager.location
---

# `CLLocationManager`：`location` 属性

**`location`** 属性是最近一次的位置。

## 值

[`CLLocation`](../cl-location.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `null`。还没定过位、或者没有授权时是 `null`。
- 每次读得到一个新的 `CLLocation` 对象，字段和上一次读到的一样。比较两个位置是不是同一个，比较字段，不要用 `===`。
- 连续更新期间新位置到来时派发 [`locationupdate`](locationupdate-event.md)，事件里带着新位置，不用再读这个属性。

## 示例

```js
const manager = new CLLocationManager();
const last = manager.location;
if (last === null) {
  console.log('还没有位置');
} else {
  console.log(last.coordinate.latitude, last.coordinate.longitude);
}
```

**效果**：还没定过位时输出 `还没有位置`；定过位时输出上一次的纬度和经度。

## 对应的 iOS API

`CLLocationManager.location`。

## 参见

- [`requestLocation()`](requestlocation.md)：取一个新的位置
- [位置是值](../cl-location.md#位置是值)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
