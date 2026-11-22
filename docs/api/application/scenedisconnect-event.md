---
type: reference
native: UISceneDidDisconnectNotification
---

# `Application`：`scenedisconnect` 事件

**`scenedisconnect`** 事件在系统销毁一个场景时派发。

## 语法

```
application.addEventListener('scenedisconnect', (event) => { })
```

## 事件对象

[`SceneEvent`](../scene-event.md)，多一个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`scene`](../scene-event/scene.md) | [`UIWindowScene`](../ui-window-scene.md) | 被销毁的场景 |

`target` 是 `application`。不能取消。

## 什么时候派发

- App 进入后台后，系统为了回收内存可以销毁场景；在 iPad 上，用户也可以从多任务界面关掉 App 的某个窗口。
- 派发时这个场景已经从 [`application.scenes`](scenes.md) 里移除。
- 销毁之后，没有被 App 保存的窗口、页面和视图一起被回收。用户回到 App 时，系统创建新的场景，再派发 [`sceneconnect`](sceneconnect-event.md)。
- 这个事件的派发**未在模拟器验证**：验收过程中系统没有销毁过场景。

## 示例

```js
/** @type {Map<UIWindowScene, UINavigationController>} */
const navigators = new Map();

application.addEventListener('sceneconnect', (e) => {
  const nav = new UINavigationController(new UIViewController());
  const win = new UIWindow(e.scene);
  win.rootViewController = nav;
  win.makeKeyAndVisible();
  navigators.set(e.scene, nav);
});

application.addEventListener('scenedisconnect', (e) => {
  navigators.delete(e.scene);
});
```

**效果**：场景接入时把它的导航控制器记进表里，场景被销毁时删掉，表里不留下已经销毁的场景。**未在模拟器验证。**

## 对应的 iOS API

`UISceneDidDisconnectNotification`，即 `sceneDidDisconnect:`。

## 参见

- [场景被销毁之后](../ui-window-scene.md#场景被销毁之后)
