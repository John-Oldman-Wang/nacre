---
type: reference
native: SceneEvent
---

# `SceneEvent`

**`SceneEvent`** 表示一个场景接入或断开。

[`application`](application.md) 的 [`sceneconnect`](application/sceneconnect-event.md) 和 [`scenedisconnect`](application/scenedisconnect-event.md) 事件是它，[`scene`](scene-event/scene.md) 是那个场景。场景是 App 界面的一个实例，见 [`UIWindowScene`](ui-window-scene.md)。

**继承关系**：[`Event`](event.md) → `SceneEvent`

## 构造函数

[`SceneEvent()`](scene-event/constructor.md)

创建一个 `SceneEvent`。运行时派发下面这些事件时自己创建它；App 的代码可以用它建一个事件对象，用 [`dispatchEvent()`](event-target/dispatchevent.md) 派发出去，试一试监听器。

## 实例属性

还继承 [`Event`](event.md) 的属性，最常用的是 `type` 和 `target`。下表的属性都是只读的，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`scene`](scene-event/scene.md) <small>只读</small> | 接入或断开的场景 |

这些属性在原型上，不在事件对象自己身上：`Object.keys(event)` 和 `{ ...event }` 拿不到它们，要一个一个读。见[带字段的事件](event.md#带字段的事件)。

## 哪些事件是这个类

| 对象 | 事件 |
| --- | --- |
| [`application`](application.md) | [`sceneconnect`](application/sceneconnect-event.md)、[`scenedisconnect`](application/scenedisconnect-event.md) |

不能取消：`cancelable` 是 `false`，`preventDefault()` 不起作用。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e instanceof SceneEvent, e.scene instanceof UIWindowScene);
  const window = new UIWindow(e.scene);
  window.rootViewController = new UIViewController();
  window.makeKeyAndVisible();
});
```

**效果**：App 启动、场景接入时输出 `true true`，屏幕上显示一个空白页面。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `scene:willConnectToSession:options:` 的参数 `scene` | `sceneconnect` 的 `event.scene` |
| `sceneDidDisconnect:` 的参数 `scene` | `scenedisconnect` 的 `event.scene` |

## 参见

- [`UIWindowScene`](ui-window-scene.md)：场景
- [`application`](application.md)：派发这种事件的对象
