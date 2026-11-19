---
type: reference
native: CLLocationCoordinate2DMake
---

# `CLLocationCoordinate2D()` 构造函数

**`CLLocationCoordinate2D()`** 构造函数用纬度和经度创建一个经纬度。

## 语法

```
new CLLocationCoordinate2D(latitude, longitude)
```

### 参数

**`latitude`**

纬度，数，单位是度。北纬是正数，南纬是负数。看起来像数的字符串按数处理：`'1.5'` 是 1.5。

**`longitude`**

经度，数，单位是度。东经是正数，西经是负数。转换规则同上。

不检查范围：超出 -90 到 90、-180 到 180 的数也能建出来。

### 返回值

新建的 `CLLocationCoordinate2D`。字段只读，不能加字段。

### 异常

**`TypeError`**

参数转不成有限的数，包括少传了参数：

- `new CLLocationCoordinate2D('north', 0)`：`CLLocationCoordinate2D latitude must be a finite number, got "north"`
- `new CLLocationCoordinate2D(1)`：`CLLocationCoordinate2D longitude must be a finite number, got undefined`

## 示例

```js
const c = new CLLocationCoordinate2D(39.9042, 116.4074);
console.log(c.latitude, c.longitude);
```

**结果**：输出 `39.9042 116.4074`。

## 对应的 iOS API

`CLLocationCoordinate2DMake(latitude, longitude)`。

## 参见

- [`latitude`](latitude.md)、[`longitude`](longitude.md)
- [安装 `@nacrejs/core-location`](../cl-location-manager.md#先装上)
