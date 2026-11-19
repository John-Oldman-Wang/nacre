---
type: reference
native: CLLocationCoordinate2D
---

# `CLLocationCoordinate2D`

**`CLLocationCoordinate2D`** 表示地球上一个点的经纬度，单位是度。北纬和东经是正数，南纬和西经是负数。

它是只读的值：字段不能改，也不能加字段。[`CLLocation`](cl-location.md) 的 `coordinate` 是它；也可以自己用 `new` 创建。

要先装 `@nacrejs/core-location`，装法见 [`CLLocationManager`](cl-location-manager.md#先装上)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`CLLocationCoordinate2D` 不继承任何原生类。

## 构造函数

[`CLLocationCoordinate2D()`](cl-location-coordinate-2d/constructor.md)

用纬度和经度创建一个经纬度。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`latitude`](cl-location-coordinate-2d/latitude.md) <small>只读</small> | 纬度，度 |
| [`longitude`](cl-location-coordinate-2d/longitude.md) <small>只读</small> | 经度，度 |

## 示例

```js
const c = new CLLocationCoordinate2D(39.9042, 116.4074);
console.log(JSON.stringify(c));
console.log(String(c));
```

**结果**

- 第一行输出 `{"latitude":39.9042,"longitude":116.4074}`。
- 第二行输出 `CLLocationCoordinate2D(39.9042, 116.4074)`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `CLLocationCoordinate2DMake(lat, lon)` | `new CLLocationCoordinate2D(lat, lon)` |
| `coordinate.latitude`、`coordinate.longitude` | `coordinate.latitude`、`coordinate.longitude` |

ObjC 里它是结构体。

## 参见

- [`CLLocation`](cl-location.md)：位置里的 `coordinate`
- [结构体](structs.md)：其他只读的值类型
