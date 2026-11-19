---
type: reference
native: CLLocation.horizontalAccuracy
---

# `CLLocation`：`horizontalAccuracy` 属性

**`horizontalAccuracy`** 属性是经纬度的误差半径：真实位置在以 [`coordinate`](coordinate.md) 为圆心、这个数为半径的圆里。

## 值

数（米），或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 数越小越准。不小于 0。
- `null` 表示这个位置的经纬度无效，不要用 `coordinate`。
- [`desiredAccuracy`](../cl-location-manager/desiredaccuracy.md) 是希望的精度；系统实际给到多准，看这个数。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  const accuracy = here.horizontalAccuracy;
  if (accuracy === null) {
    console.log('经纬度无效');
  } else if (accuracy > 200) {
    console.log('误差太大：' + accuracy + ' m');
  } else {
    console.log('可用，误差 ' + accuracy + ' m');
  }
}, () => {});
```

**效果**：按误差输出三行里的一行。

## 对应的 iOS API

`CLLocation.horizontalAccuracy`。ObjC 里无效时是负数，这里是 `null`。

## 参见

- [位置里的 `null`](../cl-location.md#位置里的-null)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
