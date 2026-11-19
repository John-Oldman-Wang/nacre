---
type: reference
native: CLLocation.verticalAccuracy
---

# `CLLocation`：`verticalAccuracy` 属性

**`verticalAccuracy`** 属性是海拔的误差。

## 值

数（米），或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 不小于 0，数越小越准。
- `null` 表示海拔无效，这时 [`altitude`](altitude.md) 和 [`ellipsoidalAltitude`](ellipsoidalaltitude.md) 也是 `null`。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.verticalAccuracy !== null && here.altitude !== null) {
    console.log('海拔 ' + here.altitude.toFixed(0) + ' ± ' + here.verticalAccuracy.toFixed(0) + ' 米');
  }
}, () => {});
```

**效果**：量出了海拔时输出海拔和误差，比如 `海拔 45 ± 3 米`。**未在模拟器验证。**

## 对应的 iOS API

`CLLocation.verticalAccuracy`。ObjC 里无效时是负数，这里是 `null`。

## 参见

- [位置里的 `null`](../cl-location.md#位置里的-null)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
