---
type: reference
native: CLLocation.speedAccuracy
---

# `CLLocation`：`speedAccuracy` 属性

**`speedAccuracy`** 属性是速度的误差。

## 值

数（米每秒），或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 不小于 0。
- `null` 表示速度无效，这时 [`speed`](speed.md) 也是 `null`。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.speed !== null && here.speedAccuracy !== null) {
    console.log(here.speed + ' ± ' + here.speedAccuracy + ' m/s');
  }
}, () => {});
```

**效果**：量出了速度时输出速度和误差（米每秒）。**未在模拟器验证。**

## 对应的 iOS API

`CLLocation.speedAccuracy`。ObjC 里无效时是负数，这里是 `null`。

## 参见

- [`speed`](speed.md)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
