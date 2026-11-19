---
type: reference
native: CLLocation.courseAccuracy
---

# `CLLocation`：`courseAccuracy` 属性

**`courseAccuracy`** 属性是移动方向的误差。

## 值

数（度），或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 不小于 0。
- `null` 表示方向无效，这时 [`course`](course.md) 也是 `null`。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  if (here.course !== null && here.courseAccuracy !== null) {
    console.log(here.course + ' ± ' + here.courseAccuracy + ' 度');
  }
}, () => {});
```

**效果**：量出了方向时输出方向和误差（度）。**未在模拟器验证。**

## 对应的 iOS API

`CLLocation.courseAccuracy`。ObjC 里无效时是负数，这里是 `null`。

## 参见

- [`course`](course.md)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
