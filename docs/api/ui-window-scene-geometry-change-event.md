---
type: reference
native: UIWindowSceneGeometryChangeEvent
---

# `UIWindowSceneGeometryChangeEvent`

**`UIWindowSceneGeometryChangeEvent`** 表示场景的几何信息变了，比如手机转了方向。

[`UIWindowScene`](ui-window-scene.md) 的 [`geometrychange`](ui-window-scene/geometrychange-event.md) 事件是它，带着变化之前的界面方向。现在的方向从场景的 `effectiveGeometry` 读。

**继承关系**：[`Event`](event.md) → `UIWindowSceneGeometryChangeEvent`

## 构造函数

[`UIWindowSceneGeometryChangeEvent()`](ui-window-scene-geometry-change-event/constructor.md)

创建一个 `UIWindowSceneGeometryChangeEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`previousInterfaceOrientation`](ui-window-scene-geometry-change-event/previousinterfaceorientation.md) <small>只读</small> | 变化之前的界面方向 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`UIWindowScene`](ui-window-scene.md) | [`geometrychange`](ui-window-scene/geometrychange-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.addEventListener('geometrychange', (change) => {
    console.log(change instanceof UIWindowSceneGeometryChangeEvent, change.previousInterfaceOrientation);
  });
});
```

**效果**：手机转方向时，输出 `true` 和变化之前的方向。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `windowScene:didUpdateEffectiveGeometry:` | `geometrychange` 事件 |
| `previousEffectiveGeometry.interfaceOrientation` | `event.previousInterfaceOrientation` |

## 参见

- [`geometrychange`](ui-window-scene/geometrychange-event.md)：什么时候派发
- [`UIWindowSceneGeometry`](ui-window-scene-geometry.md)：现在的几何信息
