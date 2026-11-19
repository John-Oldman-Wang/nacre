---
type: reference
native: CLLocationCoordinate2D.latitude
---

# `CLLocationCoordinate2D`：`latitude` 属性

**`latitude`** 属性是纬度。

## 值

数（度）。北纬是正数，南纬是负数。系统给的位置在 -90 到 90 之间；自己 `new` 的不检查范围。

- 只读。给它赋值抛 `TypeError`：`latitude is read-only: locations are values, they cannot be changed`。
- 值是创建时给的，不会变。

## 示例

```js
const c = new CLLocationCoordinate2D(-33.8688, 151.2093);
console.log(c.latitude < 0 ? '南半球' : '北半球');
```

**结果**：输出 `南半球`。

## 对应的 iOS API

`CLLocationCoordinate2D.latitude`。

## 参见

- [`longitude`](longitude.md)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
