---
type: reference
native: CLLocation.ellipsoidalAltitude
---

# `CLLocation`：`ellipsoidalAltitude` 属性

**`ellipsoidalAltitude`** 属性是这个位置的海拔，相对 WGS 84 椭球面。卫星定位直接量出的就是这个高度。

## 值

数（米），或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 系统量不出海拔时是 `null`，和 [`altitude`](altitude.md)、[`verticalAccuracy`](verticalaccuracy.md) 一起是 `null`。
- 海拔有值的情况**未在模拟器验证**。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.altitude !== null && here.ellipsoidalAltitude !== null) {
    console.log('两种海拔相差 ' + (here.ellipsoidalAltitude - here.altitude).toFixed(1) + ' 米');
  }
}, () => {});
```

**效果**：量出了海拔时输出两种海拔的差（米）。

## 对应的 iOS API

`CLLocation.ellipsoidalAltitude`。

## 参见

- [`altitude`](altitude.md)：相对平均海平面的海拔
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
