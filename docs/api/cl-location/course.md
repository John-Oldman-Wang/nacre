---
type: reference
native: CLLocation.course
---

# `CLLocation`：`course` 属性

**`course`** 属性是设备移动的方向。

## 值

数（度），或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 正北是 0，顺时针增加，正东是 90，范围 0 到 359.9。
- 系统量不出方向时是 `null`，设备没在移动时就是这样。这时 [`courseAccuracy`](courseaccuracy.md) 也是 `null`。
- 它是移动的方向，不是设备朝向的方向。

## 示例

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  const latest = e.locations[e.locations.length - 1];
  console.log(latest.course === null ? '没在移动' : '朝 ' + latest.course.toFixed(0) + ' 度');
});
manager.startUpdatingLocation();
```

**效果**：每次有新位置输出一行：在移动时输出方向（度），没在移动时输出 `没在移动`。在移动的那一种**未在模拟器验证**。

## 对应的 iOS API

`CLLocation.course`。ObjC 里无效时是负数，这里是 `null`。

## 参见

- [`speed`](speed.md)：移动的速度
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
