# `UIWindowScene`

一个场景 ＝ App 的一个 UI 实例，是 **JS 创建界面的唯一入口**——`UIWindow` 只能用 `initWithWindowScene:` 构造，没有场景就造不出窗口。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  win.rootViewController = vc;
  win.makeKeyAndVisible();
});
```

## 继承关系

```
EventTarget → UIWindowScene
```

ObjC 侧的真实继承是 `UIWindowScene : UIScene : UIResponder : NSObject`，JS 侧中间几层还没补上。

## 不可构造

```js
new UIWindowScene()   // TypeError: Illegal constructor
```

场景由**系统**创建并连接。这是整条 UI 链上唯一不可构造的类——再往下的 `UIWindow`、`UIViewController`、`UIView` 都能 `new`。

## 怎么拿到：只能靠事件

`application.scenes` 在 `main.js` 执行时**几乎总是空的**——场景在 `didFinishLaunching` 之后才接入：

```js
// ✗ 拿不到
const scene = application.scenes[0];

// ✓
application.addEventListener('sceneconnect', (e) => buildUI(e.scene));
```

`buildUI` 必须**可重入**：场景会反复接入断开（系统回收内存、用户关窗口），同一个 App 生命周期里可能被调用多次。

## 身份一致

同一个原生场景在 JS 里**永远是同一个对象**，所以 `===` 能用，挂在上面的自定义属性也不会丢：

```js
e.scene === application.scenes[0];   // true
e.scene.myData = { page: 'home' };
application.scenes[0].myData.page;   // 'home'
```

## 实例属性

| 属性 | 类型 | 效果 |
| --- | --- | --- |
| `activationState` | `'unattached'` \| `'foregroundActive'` \| `'foregroundInactive'` \| `'background'` 只读 | **这个场景自己的**前后台状态，和 `application.state`（所有场景的聚合）不是一回事 |
| `session` | [`UISceneSession`](#uiscenesession) 只读 | 场景的持久身份 |
| `isFullScreen` | `boolean` 只读 | |
| `title` | `string` 读写 | 多任务切换器卡片上的标题 |
| `subtitle` | `string` 读写 | 同上 |

## 实例方法

| 方法 | 返回 | 效果 |
| --- | --- | --- |
| `openURL(url)` | `Promise<boolean>` | 场景级地打开 URL。URL 无效或系统拒绝时兑现为 `false`，不抛 |

`application.openURL` 是 App 级的，两个都有。

## 事件

| 事件 | 什么时候 |
| --- | --- |
| `active` | 这个场景变为活跃 |
| `inactive` | 这个场景将要失活 |
| `foreground` | 将要进入前台 |
| `background` | 已进入后台 |

和 `application` 上的同名事件**语义不同**：这里是「这个窗口」，`application` 上是「所有场景的聚合」。单场景时两者成对出现。

**场景的接入和断开挂在 `application` 上**，不在这里：

```js
application.addEventListener('sceneconnect', (e) => { /* e.scene */ });
application.addEventListener('scenedisconnect', (e) => { /* e.scene */ });
```

### 一个时序差异

**场景事件到达时 `scene.activationState` 已经是新值，而 `application.state` 还是旧值。** 实测同一时刻：

```
场景事件 inactive    → scene.activationState = foregroundInactive   ← 已更新
生命周期事件 inactive → application.state     = active               ← 还是旧值
```

要读「现在到底什么状态」，在场景事件里读 `scene.activationState` 是准的。

## `UISceneSession`

场景的**持久身份**。场景对象会被系统销毁重建，session 活得更久——靠它判断「这是全新窗口」还是「之前那个窗口回来了」。

同样不可构造，同样身份一致（`scene.session === scene.session`）。

| 属性 | 类型 | 效果 |
| --- | --- | --- |
| `role` | `string` 只读 | `'UIWindowSceneSessionRoleApplication'`（普通窗口）、`'…ExternalDisplayNonInteractive'`（外接显示器）等。**决定这个场景该画什么界面** |
| `persistentIdentifier` | `string` 只读 | 跨销毁重建保持不变 |
| `userInfo` | `object` 读写 | 给这个窗口打标记，随 session 持久化 |

### `userInfo` 怎么用

整个 session 会被系统持久化，所以 `userInfo` 里的东西能活过「场景断开重连」「App 被杀掉重开」「多任务切换器里的卡片」。

用途是**标记这个窗口在看什么**：

```js
application.addEventListener('sceneconnect', (e) => {
  const info = e.scene.session.userInfo;
  if (info.kind === 'mailDetail') openMail(info.mailId);   // 恢复到关掉前那封邮件
  else openInbox();
});
```

> **值必须是 plist 类型**——字符串、数字、布尔、数组、字典。**`null` 不是**，写进去系统可能在持久化时丢弃。

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `UISceneWillConnectNotification` | `application.addEventListener('sceneconnect', …)` |
| `UISceneDidDisconnectNotification` | `application.addEventListener('scenedisconnect', …)` |
| `UISceneDidActivateNotification` | `scene.addEventListener('active', …)` |
| `UISceneWillDeactivateNotification` | `scene.addEventListener('inactive', …)` |
| `UISceneWillEnterForegroundNotification` | `scene.addEventListener('foreground', …)` |
| `UISceneDidEnterBackgroundNotification` | `scene.addEventListener('background', …)` |
| `scene.activationState == UISceneActivationStateForegroundActive` | `scene.activationState === 'foregroundActive'` |
| `scene.isFullScreen` | `scene.isFullScreen` |
| `[scene openURL:url options:nil completionHandler:^(BOOL ok){}]` | `await scene.openURL(url)` |
| `scene.session.persistentIdentifier` | `scene.session.persistentIdentifier` |

## 还没做

| | |
| --- | --- |
| `windows` / `keyWindow` | |
| `screen` / `traitCollection` / `effectiveGeometry` / `sizeRestrictions` | 各自依赖对应的类 |
| 屏幕方向（读 + 写 + 变化通知） | 方案已定，见[项目说明](../project.md#屏幕方向方案已定未实现) |
| `activationConditions` / `destructionConditions` | iPad 多窗口 |
| `delegate` | **不打算暴露**——它是运行时自己设的，JS 改它只会破坏运行时 |
| `requestGeometryUpdate(…)` | iPad/Mac 上请求改窗口大小 |

---

← 返回 [API 文档](README.md) ・ [`application`](application.md)
