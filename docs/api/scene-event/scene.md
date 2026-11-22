---
type: reference
native: SceneEvent.scene
---

# `SceneEvent`：`scene` 属性

**`scene`** 属性是接入或断开的那个场景。

## 值

[`UIWindowScene`](../ui-window-scene.md)。

- 只读。给它赋值抛 `TypeError`。
- `sceneconnect` 里是系统刚创建的场景，在它上面建窗口。
- `scenedisconnect` 里是被销毁的场景。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const window = new UIWindow(e.scene);
  window.rootViewController = new UIViewController();
  window.makeKeyAndVisible();
});
```

**效果**：场景接入时建一个窗口，屏幕上显示一个空白页面。

## 对应的 iOS API

`scene:willConnectToSession:options:` 和 `sceneDidDisconnect:` 的参数 `scene`。

## 参见

- [`SceneEvent`](../scene-event.md)
- [`sceneconnect`](../application/sceneconnect-event.md)
- [`scenedisconnect`](../application/scenedisconnect-event.md)
