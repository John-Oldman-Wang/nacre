---
type: reference
native: CLLocationErrorEvent
---

# `CLLocationErrorEvent`

**`CLLocationErrorEvent`** 表示定位出了错。

[`CLLocationManager`](cl-location-manager.md) 的 [`locationerror`](cl-location-manager/locationerror-event.md) 事件是它，[`error`](cl-location-error-event/error.md) 是出的错。

它属于 `@nacrejs/core-location` 这个包，装法见 [`CLLocationManager`](cl-location-manager.md#先装上)。

**继承关系**：[`Event`](event.md) → `CLLocationErrorEvent`

## 构造函数

[`CLLocationErrorEvent()`](cl-location-error-event/constructor.md)

创建一个 `CLLocationErrorEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`error`](cl-location-error-event/error.md) <small>只读</small> | 出的错 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`CLLocationManager`](cl-location-manager.md) | [`locationerror`](cl-location-manager/locationerror-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
const manager = new CLLocationManager();
manager.addEventListener('locationerror', (e) => {
  console.log(e instanceof CLLocationErrorEvent, e.error.name);
});
manager.startUpdatingLocation();
```

**效果**：定位出错时，输出 `true` 和错误的分类。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `locationManager:didFailWithError:` | `locationerror` 事件 |
| 参数 `error` | `event.error` |

## 参见

- [`CLLocationManager`](cl-location-manager.md)：派发这个事件的对象
- [`CLLocationError`](cl-location-error.md)
