---
type: reference
native: CLLocation
status: partial
---

# `CLLocation`

**`CLLocation`** 表示系统量到的一个位置：经纬度、海拔、各个量的误差、速度、移动方向，以及这个位置是什么时候量的。

位置只能由系统给，从 [`CLLocationManager`](cl-location-manager.md) 得到。它是只读的值：字段不能改，也不能加字段。

要先装 `@nacrejs/core-location`，装法见 [`CLLocationManager`](cl-location-manager.md#先装上)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`CLLocation` 不继承任何原生类。

## 构造函数

不能用 `new` 创建。`new CLLocation()` 抛 `TypeError`：

```
Illegal constructor: a CLLocation comes from CLLocationManager (location, requestLocation(), or the locationupdate event)
```

位置从这三处得到：

- [`manager.location`](cl-location-manager/location.md)：最近一次的位置。
- [`manager.requestLocation()`](cl-location-manager/requestlocation.md)：Promise 兑现成一个位置。
- [`locationupdate`](cl-location-manager/locationupdate-event.md) 事件的 `locations`。

## 实例属性

所有属性可读、不可写。

| 属性 | 说明 |
| --- | --- |
| [`coordinate`](cl-location/coordinate.md) <small>只读</small> | 经纬度 |
| [`horizontalAccuracy`](cl-location/horizontalaccuracy.md) <small>只读</small> | 经纬度的误差半径，米 |
| [`altitude`](cl-location/altitude.md) <small>只读</small> | 海拔，相对平均海平面，米 |
| [`ellipsoidalAltitude`](cl-location/ellipsoidalaltitude.md) <small>只读</small> | 海拔，相对 WGS 84 椭球面，米 |
| [`verticalAccuracy`](cl-location/verticalaccuracy.md) <small>只读</small> | 海拔的误差，米 |
| [`speed`](cl-location/speed.md) <small>只读</small> | 移动的速度，米每秒 |
| [`speedAccuracy`](cl-location/speedaccuracy.md) <small>只读</small> | 速度的误差，米每秒 |
| [`course`](cl-location/course.md) <small>只读</small> | 移动的方向，度 |
| [`courseAccuracy`](cl-location/courseaccuracy.md) <small>只读</small> | 方向的误差，度 |
| [`timestamp`](cl-location/timestamp.md) <small>只读</small> | 这个位置是什么时候量的 |
| [`sourceInformation`](cl-location/sourceinformation.md) <small>只读</small> | 这个位置是不是模拟的、是不是来自外接配件 |

## 位置里的 `null`

有八个量在系统量不出来时是 `null`：

| 是 `null` 的量 | 说明什么 |
| --- | --- |
| `horizontalAccuracy` | 这个位置的经纬度无效，不要用 `coordinate` |
| `verticalAccuracy`、`altitude`、`ellipsoidalAltitude` | 海拔量不出来。这三个量总是一起是 `null`，或者一起有值 |
| `speed`、`speedAccuracy` | 速度量不出来 |
| `course`、`courseAccuracy` | 方向量不出来。设备没在移动时就是这样 |

用这些量之前先判断是不是 `null`。其余的量（`coordinate`、`timestamp`）总是有值。

## 位置是值

- 字段不能改，也不能加字段，写了抛 `TypeError`。改已有的字段，报错是 `<字段名> is read-only: locations are values, they cannot be changed`。
- 每次读 [`manager.location`](cl-location-manager/location.md) 得到一个新的 `CLLocation` 对象。比较两个位置是不是同一个，比较它们的字段，不要用 `===`。
- 同一个 `CLLocation` 上，每次读 `coordinate` 得到同一个对象。
- 每次读 `timestamp` 得到一个新的 `Date`。修改读出来的 `Date` 不影响位置。

## 示例

```js
const manager = new CLLocationManager();
manager.requestLocation().then((here) => {
  console.log(here.coordinate.latitude, here.coordinate.longitude);
  if (here.altitude === null) {
    console.log('没有海拔');
  } else {
    console.log('海拔 ' + here.altitude.toFixed(1) + ' 米');
  }
}, (err) => {
  console.log('没取到：' + err.name);
});
```

**效果**：取到位置时先输出纬度和经度，再输出海拔（米，保留一位小数）或者「没有海拔」。模拟器里用命令设的位置没有海拔，输出的是「没有海拔」。没有授权时输出 `没取到：NotAllowedError`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `location.coordinate` | `location.coordinate` |
| `location.horizontalAccuracy < 0`（无效） | `location.horizontalAccuracy === null` |
| `location.speed < 0`、`location.course < 0`（无效） | `location.speed === null`、`location.course === null` |
| `location.timestamp`（`NSDate`） | `location.timestamp`（`Date`） |
| `location.sourceInformation.isSimulatedBySoftware` | `location.sourceInformation?.isSimulatedBySoftware` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 算两个位置之间的距离 | `distanceFromLocation:` |
| 位置在建筑的第几层 | `CLLocation.floor` |
| 自己造一个 `CLLocation` | `initWithLatitude:longitude:` 一组 |

这几个成员在 `CLLocation` 上不存在：`'floor' in location` 和 `'distanceFromLocation' in location` 都是 `false`。

## 参见

- [`CLLocationManager`](cl-location-manager.md)：位置从哪来
- [`CLLocationCoordinate2D`](cl-location-coordinate-2d.md)：`coordinate` 的类型
- [取用户的位置](../guides/get-location.md#挑出可用的位置)：按误差和时间挑出可用的位置
