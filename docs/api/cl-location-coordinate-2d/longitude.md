---
type: reference
native: CLLocationCoordinate2D.longitude
---

# `CLLocationCoordinate2D`：`longitude` 属性

**`longitude`** 属性是经度。

## 值

数（度）。东经是正数，西经是负数。系统给的位置在 -180 到 180 之间；自己 `new` 的不检查范围。

- 只读。给它赋值抛 `TypeError`：`longitude is read-only: locations are values, they cannot be changed`。
- 值是创建时给的，不会变。

## 示例

```js
const c = new CLLocationCoordinate2D(40.7128, -74.006);
console.log(c.longitude < 0 ? '西经' : '东经');
```

**结果**：输出 `西经`。

## 对应的 iOS API

`CLLocationCoordinate2D.longitude`。

## 参见

- [`latitude`](latitude.md)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
