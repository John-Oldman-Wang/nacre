---
type: reference
native: UISceneWillConnectNotification
---

# `Application`：`sceneconnect` 事件

**`sceneconnect`** 事件在系统创建好一个场景、交给 App 时派发。建界面的代码写在它的回调里。

## 语法

```
application.addEventListener('sceneconnect', (event) => { })
```

## 事件对象

[`SceneEvent`](../scene-event.md)，多一个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`scene`](../scene-event/scene.md) | [`UIWindowScene`](../ui-window-scene.md) | 系统刚创建的场景 |

`target` 是 `application`。不能取消，`cancelable` 是 `false`。

## 什么时候派发

- **在 `main.js` 执行完之后。** App 启动后，运行时先把整个 `main.js` 执行完，系统随后才创建场景。所以在 `main.js` 顶层执行的那段时间里没有场景，建不出能显示的窗口。
- **监听器要在 `main.js` 的顶层注册。** 运行时保证这个事件在 `main.js` 执行完之后才派发，顶层注册的监听器一定能收到。事件不会补发：如果等到某个 `Promise` 兑现之后才注册，这时事件可能已经派发过，监听器就收不到了。
- **可能派发不止一次。** App 启动时派发一次；之后系统如果销毁了场景，用户回到 App 时系统创建一个新的场景，再派发一次。所以回调要写成可以重复执行的：每次都用 `e.scene` 从头建一遍界面，不依赖上一次建出来的窗口和页面。多次接入的情况**未在模拟器验证**。
- 派发时，`e.scene` 已经在 [`application.scenes`](scenes.md) 里，和其中的元素是同一个对象。
- 系统在弹出键盘时也会创建自己内部用的场景。这类场景不会引起 `sceneconnect`。
- App 是被一条链接启动的时候，[`openurl`](openurl-event.md) 排在同一个场景的 `sceneconnect` 之后。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();
  console.log(e.scene instanceof UIWindowScene);
});
```

**效果**：App 启动后屏幕显示一个空白页面，底色是系统背景色。控制台输出 `true`。

回调里的 `win` 和 `page` 不需要保存到回调外面：窗口建在场景上、页面交给窗口之后，运行时会保管它们。

## 对应的 iOS API

`UISceneWillConnectNotification`，即 `SceneDelegate` 的 `scene:willConnectToSession:options:`。

## 参见

- [建窗口和处理场景](../../guides/scenes-and-windows.md)：启动代码怎么组织、数据放在哪里
- [`scenedisconnect`](scenedisconnect-event.md)
