---
type: reference
native: CLLocationUpdateEvent
---

# `CLLocationUpdateEvent`

**`CLLocationUpdateEvent`** 表示系统报上来了新的位置。

[`CLLocationManager`](cl-location-manager.md) 的 [`locationupdate`](cl-location-manager/locationupdate-event.md) 事件是它，[`locations`](cl-location-update-event/locations.md) 是这一次报上来的位置。

它属于 `@nacrejs/core-location` 这个包，装法见 [`CLLocationManager`](cl-location-manager.md#先装上)。

**继承关系**：[`Event`](event.md) → `CLLocationUpdateEvent`

## 构造函数

[`CLLocationUpdateEvent()`](cl-location-update-event/constructor.md)

创建一个 `CLLocationUpdateEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`locations`](cl-location-update-event/locations.md) <small>只读</small> | 这一次报上来的位置，最后一个是最新的 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`CLLocationManager`](cl-location-manager.md) | [`locationupdate`](cl-location-manager/locationupdate-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const manager = new CLLocationManager();
manager.addEventListener('locationupdate', (e) => {
  console.log(e instanceof CLLocationUpdateEvent, e.locations.length);
});
manager.requestLocation();
```

**效果**：取到位置时，输出 `true` 和这一次报上来的位置个数。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `locationManager:didUpdateLocations:` | `locationupdate` 事件 |
| 参数 `locations` | `event.locations` |

## 参见

- [`CLLocationManager`](cl-location-manager.md)：派发这个事件的对象
- [`CLLocation`](cl-location.md)
