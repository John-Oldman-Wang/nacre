---
type: reference
native: "-[UIWindowScene requestGeometryUpdateWithPreferences:errorHandler:]"
---

# `UIWindowScene`：`requestGeometryUpdateWithPreferences()` 方法

**`requestGeometryUpdateWithPreferences()`** 方法请求把界面转到某个方向，比如点「全屏」时转成横屏。

## 语法

```
requestGeometryUpdateWithPreferences(preferences)
```

## 参数

**`preferences`**

[`UIWindowSceneGeometryPreferencesIOS`](../ui-window-scene-geometry-preferences-ios.md)：想要哪几个方向。系统从「想要的」和「允许的」两者的交集里挑一个。

## 返回值

`Promise<void>`。

| 情况 | 结果 |
| --- | --- |
| 现在的方向已经在想要的里面 | 当场兑现 |
| 系统允许，开始转 | 方向真的变过去之后兑现，也就是 [`geometrychange`](geometrychange-event.md) 之后。在 iPhone Air 模拟器（iOS 27.2）上约 0.5 秒 |
| 系统不允许（想要的方向不在 App 或页面允许的里面） | 拒绝。错误的 `message` 是系统给的原因，比如 `None of the requested orientations are supported by the view controller. …`，`code` 是系统的错误码 |

以上都是实测。

## 异常

**`TypeError`**

- 参数不是 `UIWindowSceneGeometryPreferencesIOS`：`requestGeometryUpdateWithPreferences needs a UIWindowSceneGeometryPreferencesIOS`。
- 偏好里一个方向都没有：`requestGeometryUpdateWithPreferences: the preferences have no interfaceOrientations`。

## 说明

能转过去的前提有两层：`nacre.config.json` 的 [`ios.orientations`](../../guides/project-config.md#声明-app-允许的方向) 声明了这个方向；最上面那个全屏页面的 [`supportedInterfaceOrientations`](../ui-view-controller/supportedinterfaceorientations.md) 也允许它。要转成横屏，先放开页面允许的方向，再请求。

## 示例

```js
application.addEventListener('sceneconnect', async (e) => {
  const scene = e.scene;
  const page = new UIViewController();
  const win = new UIWindow(scene);
  win.rootViewController = page;
  win.makeKeyAndVisible();

  page.supportedInterfaceOrientations = ['portrait', 'landscapeRight'];
  await scene.requestGeometryUpdateWithPreferences(new UIWindowSceneGeometryPreferencesIOS(['landscapeRight']));
  console.log(scene.effectiveGeometry.interfaceOrientation);
});
```

**效果**：`nacre.config.json` 声明了横屏时，界面转成横屏，输出 `landscapeRight`。没声明时 Promise 被拒绝。

## 对应的 iOS API

`-[UIWindowScene requestGeometryUpdateWithPreferences:errorHandler:]`。原生没有「成功」的回调，这里的兑现时机照 Web 的 `screen.orientation.lock()`。

## 参见

- [`UIWindowSceneGeometryPreferencesIOS`](../ui-window-scene-geometry-preferences-ios.md)
- [`geometrychange`](geometrychange-event.md)
