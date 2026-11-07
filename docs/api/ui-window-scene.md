# `UIWindowScene`

一个场景＝App 的一个 UI 实例。它是 **JS 创建界面的唯一入口**——`UIWindow` 的指定初始化方法是 `initWithWindowScene:`，另外两个在 iOS 26 已废弃，所以没有 scene 就造不出窗口。

这是**底层 API**：按 ObjC 类名裸暴露，成员名也和 ObjC 一致。

## 继承关系

```
EventTarget
└─ UIWindowScene
```

ObjC 侧的真实继承是 `UIWindowScene : UIScene : UIResponder : NSObject`。JS 侧暂时只接到 `EventTarget`，等有了通用桥接再把中间层补齐——届时继承链会从 ObjC 运行时自动来，已经写好的 JS 代码不受影响。

## 构造

**不可构造。** SDK 自己就是 `init NS_UNAVAILABLE`，指定初始化方法注明「由 UIKit 调用，不打算让 App 调用」。

```js
new UIWindowScene()   // TypeError: Illegal constructor
```

场景由**系统**创建并连接，JS 只能通过 `sceneconnect` 事件或 `application.scenes` 拿到。

> 这是整条 UI 链上**唯一**不可构造的类。再往下的 `UIWindow`、`UIViewController`、`UIView` 都是我们创建的，必须可构造。

## 怎么拿到

**只能靠事件驱动。** `application.scenes` 在 `main.js` 执行时几乎总是空的——场景在 `didFinishLaunching` 之后才接入：

```js
// ✗ 错的：main.js 跑的时候 scenes 是空的
const scene = application.scenes[0];

// ✓ 对的
application.addEventListener('sceneconnect', (e) => {
  buildUI(e.scene);
});
```

而且 `buildUI` 必须**可重入**：场景会反复接入断开（系统回收内存、用户关窗口），同一个 App 生命周期里可能被调用多次。

## 实例属性

| 属性 | 类型 | 说明 | 状态 |
| --- | --- | --- | --- |
| `activationState` | `'unattached'` \| `'foregroundActive'` \| `'foregroundInactive'` \| `'background'` | 这个场景自己的前后台状态，和 `application.state`（所有场景的聚合）不是一回事 | 已实现 |
| `session` | [`UISceneSession`](#uiscenesession) | 场景的持久身份 | 已实现 |
| `isFullScreen` | boolean | ObjC 的属性名是 `fullScreen`、getter 是 `isFullScreen`，这里用后者 | 已实现 |
| `title` | string，**可写** | 多任务切换器卡片上显示的标题 | 已实现 |
| `subtitle` | string，**可写** | 同上 | 已实现 |
| `windows` / `keyWindow` | array / object | 这个场景里的窗口 | 待做，依赖 `UIWindow` |
| `screen` / `traitCollection` / `effectiveGeometry` / `sizeRestrictions` | | 显示环境与几何 | 待做，各自依赖对应的类 |
| `activationConditions` / `destructionConditions` | | iPad 多窗口 | 待做 |
| `delegate` | | **不打算暴露**——它是运行时自己设的 `SceneDelegate`，JS 改它只会破坏运行时 | 不做 |

## 实例方法

| 方法 | 返回 | 说明 | 状态 |
| --- | --- | --- | --- |
| `openURL(url, options?)` | `Promise<boolean>` | 场景级的打开 URL。`application.openURL` 是 App 级的，两者都有 | 已实现 |
| `requestGeometryUpdate(…)` | | iPad/Mac 上请求改变窗口大小 | 待做 |

## `UISceneSession`

场景的**持久身份**。场景对象会被系统销毁重建，session 活得更久——所以要靠它判断「这是全新窗口」还是「之前那个窗口回来了」。

| 属性 | 类型 | 说明 | 状态 |
| --- | --- | --- | --- |
| `role` | string | `'UIWindowSceneSessionRoleApplication'`（普通窗口）、`'UIWindowSceneSessionRoleExternalDisplayNonInteractive'`（外接显示器）等。**决定这个场景该画什么界面** | 已实现 |
| `persistentIdentifier` | string | 跨销毁重建保持不变，用来认出是不是同一个窗口 | 已实现 |
| `userInfo` | object，**可写** | 给这个窗口打标记：「它在看什么」。随 session 持久化，详见下 | 已实现 |
| `configuration` / `stateRestorationActivity` | | | 待做，依赖对应的类 |

`UISceneSession` 同样不可构造，身份同样一致（`scene.session === scene.session`）。

### `userInfo` 怎么用

`UISceneSession` 实现了 `NSSecureCoding`，整个 session 会被系统**持久化**。所以 `userInfo` 里的东西能活过「场景断开重连」「App 被杀掉重开」「多任务切换器里的卡片」。

它的用途是**给每个窗口打标记，说明这个窗口在看什么**——多窗口时尤其重要：

```js
application.addEventListener('sceneconnect', (e) => {
  const info = e.scene.session.userInfo;
  if (info.kind === 'mailDetail') {
    openMail(info.mailId);      // 恢复到关掉前那封邮件
  } else {
    openInbox();
  }
});
```

它和旁边的 `stateRestorationActivity` 分工：`userInfo` 是纯本地的普通字典，标记「这个窗口是什么」；`stateRestorationActivity` 是 `NSUserActivity`，更结构化，还能兼做 Handoff / Spotlight。

> **值必须是 plist 类型**（SDK 原话：`objects must be plist types`）——字符串、数字、布尔、数组、字典。**`null` 不是 plist 类型**，写进去系统可能在持久化时丢弃它。JSON 能表达的其余类型都在安全范围内。

## 事件

| 事件 | 对应 iOS 通知 | 状态 |
| --- | --- | --- |
| `active` | `UISceneDidActivateNotification` | 已实现 |
| `inactive` | `UISceneWillDeactivateNotification` | 已实现 |
| `foreground` | `UISceneWillEnterForegroundNotification` | 已实现 |
| `background` | `UISceneDidEnterBackgroundNotification` | 已实现 |

这四个和 `application` 上的同名事件**语义不同**：这里是「这个窗口」，`application` 上是「所有场景的聚合」。单场景时两者会成对出现。

### 一个要注意的时序差异

**场景的 `activationState` 在 `Will*` 类事件到达时已经是新值了，而 `application.state` 还是旧值。** 实测同一时刻：

```
✓ 场景事件: inactive   | scene.activationState = foregroundInactive   ← 已更新
✓ 生命周期事件: inactive | application.state     = active              ← 还是旧值
```

所以要读「现在到底什么状态」，在场景事件里读 `scene.activationState` 是准的。

场景的接入和断开挂在 **`application`** 上，不在这里——因为那是场景本身的生死：

| 事件（在 `application` 上） | 说明 | 状态 |
| --- | --- | --- |
| `sceneconnect` | 场景接入，`event.scene` 是场景对象 | 已实现 |
| `scenedisconnect` | 场景断开 | 已实现 |

## 身份一致

**同一个原生场景，在 JS 里永远是同一个对象。**

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene === application.scenes[0];   // true
  e.scene.myData = { page: 'home' };
  application.scenes[0].myData.page;   // 'home'
});
```

这不是细节——没有这条保证，`===` 比较会失效，挂在包装对象上的自定义属性会凭空消失，用 `Map` / `WeakMap` 做缓存也会失败。

## 屏幕方向（待做，方案已定）

方向是第一个能完整走通「读 + 写 + 变化通知」三格的能力，而且「写」那一格会把**「系统要同步返回值，就转成 JS 预先声明的状态」**这个模式第一次落地。

**注意 iOS 26 挪过位置**：`UIWindowScene.interfaceOrientation` 已废弃，方向现在在 `effectiveGeometry` 上；旧的 `windowScene:didUpdateCoordinateSpace:interfaceOrientation:traitCollection:` 也废弃了，换成 `windowScene:didUpdateEffectiveGeometry:`。

| 格 | JS 形态 | 原生怎么实现 |
| --- | --- | --- |
| **读** | `scene.effectiveGeometry.interfaceOrientation` | 新增 `UIWindowSceneGeometry` 类，先只暴露 `interfaceOrientation` 和 `isInterfaceOrientationLocked` 两个基本类型成员，`systemFrame` 等结构体等有结构体支持再说 |
| **写** | `scene.supportedOrientations = ['portrait', 'landscapeLeft']` | 运行时存下这个值；`SceneDelegate` 实现 `supportedInterfaceOrientationsForWindowScene:`，**直接返回存的值，不回 JS**；写入时调 `setNeedsUpdateOfSupportedInterfaceOrientations` 告诉系统「变了，再问一次」 |
| **变化通知** | `scene` 上的 `geometrychange` 事件 | 实现 `windowScene:didUpdateEffectiveGeometry:` |

「写」这一格的关键在于：**系统的回调是同步的，但回调的内容来自异步设置的状态**。这正是 Apple 官方推荐的写法——`shouldAutorotate` 的废弃说明里原话就是「更新你支持的方向，然后调 `setNeedsUpdateOfSupportedInterfaceOrientations` 来表示变了」。React Native 生态的方向库也是这个模式，只是它要求 App 开发者手改 `AppDelegate`，而我们做进运行时。

用**属性**而不是方法（`scene.supportedOrientations = [...]` 而不是 `scene.setSupportedOrientations([...])`），因为它表达的是状态而非动作——第 2 节原则 2「能力导向」。

还有一个要分清的：**设备方向 ≠ 界面方向**。`UIDevice.orientation` 是物理朝向（还含面朝上/朝下），`interfaceOrientation` 是界面实际显示的方向。App 锁竖屏时设备横过来，设备方向变了但界面方向不变。要不要同时暴露设备方向，单独定。

另外实际开发中更常用的是**每个页面**的方向（`UIViewController.supportedInterfaceOrientations`），scene 这层管的是窗口整体。等 `UIViewController` 做了再补那一层。

## 实现说明

- **句柄不用 V8 的 internal field**，而是挂在内置脚本闭包里的一个 Symbol 上。用 internal field 就得绕过 JS 构造函数来建对象，`EventTarget` 的监听器表就初始化不了
- **C++ 侧维护两张表**：`原生指针 → 句柄 id` 和 `句柄 id → 弱 Global<Object>`。要把原生对象交给 JS 时先查表，命中就复用——这就是身份一致的来源
- **所有权统一用强引用**：包装对象建立时 `CFRetain`，被 GC 回收时（V8 的 weak callback）`CFRelease`。不用弱引用是因为那要处理原生对象先死的悬空问题；强引用最坏只是数据过期（比如场景已断开），不会崩
- **属性读写走一张分发表**。C++ 侧只有四个通用桥函数（读属性 / 写属性 / 读对象属性 / 异步方法），值用 JSON 编码；具体哪个类有哪个属性在 iOS 层的分发表里。加一个属性只要加一行，不用动 C++。

  这是**手写方案**，撑得过 scene、window 这几个类；到 `UIView` 那一层（成百上千个属性）就必须换成通用的能力暴露方案
- **GC 回收路径尚未验证**——很难在测试里强制触发 V8 的 GC。建立、复用、嵌套对象（`scene.session`）都验证过了

---

← 返回 [API 总览](README.md) ・ [`application`](application.md)
