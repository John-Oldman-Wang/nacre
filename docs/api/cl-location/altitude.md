---
type: reference
native: CLLocation.altitude
---

# `CLLocation`：`altitude` 属性

**`altitude`** 属性是这个位置的海拔，相对平均海平面。

## 值

数（米），或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 高于海平面是正数，低于是负数。
- 系统量不出海拔时是 `null`。这时 [`ellipsoidalAltitude`](ellipsoidalaltitude.md) 和 [`verticalAccuracy`](verticalaccuracy.md) 也是 `null`：这三个量总是一起是 `null`，或者一起有值。
- 模拟器里用命令设的位置没有海拔，读到 `null`。海拔有值的情况**未在模拟器验证**。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.altitude === null) {
    console.log('没有海拔');
  } else {
    console.log('海拔 ' + here.altitude.toFixed(1) + ' 米');
  }
}, () => {});
```

**效果**：系统量出了海拔时输出海拔（米，保留一位小数），量不出来时输出「没有海拔」。

## 对应的 iOS API

`CLLocation.altitude`。ObjC 里海拔无效看的是 `verticalAccuracy` 是否为负数，这里海拔本身是 `null`。

## 参见

- [`ellipsoidalAltitude`](ellipsoidalaltitude.md)：另一种海拔
- [位置里的 `null`](../cl-location.md#位置里的-null)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
