---
type: reference
native: RemoteNotifications
status: partial
---

# `RemoteNotifications`

**`RemoteNotifications`** 表示这个 App 的远程推送：向 Apple 的推送服务注册、拿到这台设备的令牌，以及收到静默推送。它唯一的实例是 [`application`](application.md) 的 [`remoteNotifications`](application/remotenotifications.md) 属性。

**远程推送**是由服务器发出、经 Apple 的推送服务（APNs，Apple Push Notification service）送到手机上的一条消息。服务器靠**设备令牌**指明发给哪台设备上的哪个 App。设备令牌是 App 向 Apple 注册之后得到的一串字符。App 把令牌交给自己的服务器，服务器带着它发推送。

远程推送分两种，App 从不同的地方得知它们到了：

| | 是什么 | App 从哪里得知 |
| --- | --- | --- |
| 能看见的推送 | 系统展示的横幅、声音、角标，和本地通知的样子一样 | `@nacrejs/user-notifications` 的 [`notification`](un-user-notification-center/notification-event.md) 和 [`notificationclick`](un-user-notification-center/notificationclick-event.md) 事件 |
| 静默推送 | 推送内容里带 `"content-available": 1`。系统不展示任何东西，在后台唤醒 App，让它做一件事，比如拉一次数据 | 这个类的 [`push`](remote-notifications/push-event.md) 事件 |

它属于 `@nacrejs/push` 这个包。

注册和拿令牌在真机上实测过。真的从服务器发一条推送到手机还没有验证，推送到达之后的系统行为各成员页逐处标出「**未在真机验证**」。

**继承关系**：[`EventTarget`](event-target.md) → `RemoteNotifications`

怎么签名、把令牌交给服务器、处理静默推送，见指南[远程推送](../guides/push-notifications.md)。

## 要先安装

远程推送不在核心里，要先装 `@nacrejs/push` 这个包才有。没装的时候 `application.remoteNotifications` 这个属性不存在（`'remoteNotifications' in application` 是 `false`），全局上也没有 `RemoteNotifications` 和 `PushEvent`。

这个包不需要权限文案：注册推送不弹提示框。它需要一条 entitlement。entitlement 是 App 向系统申请的特殊能力，签名时写进 App。

**1. 装包。**

```bash
npm install @nacrejs/push
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacrePush.framework`。不装的项目，产物里没有它。

**2. 在 `nacre.config.json` 里写 entitlement。**

```json
{
  "ios": {
    "entitlements": { "aps-environment": "development" }
  }
}
```

**效果**：生成的 App 带上 `aps-environment` 这条 entitlement。开发时写 `development`，上架的版本写 `production`。装了包而没写这一条，生成时报错并停下：

```
nacre: @nacrejs/push needs the entitlement aps-environment. Put it in ios.entitlements in nacre.config.json
```

**3. 用开了推送能力的描述文件签名。** 描述文件是 Apple 发的一个文件，规定哪个包名的 App 能装在哪些设备上、能用哪些能力。签名用的描述文件里没有推送能力时，[`register()`](remote-notifications/register.md) 被拒绝。怎么在 Apple 开发者网站上准备它，见指南的[用开了推送能力的描述文件签名](../guides/push-notifications.md#用开了推送能力的描述文件签名)。

**4. 让类型进来。** 在入口文件顶上加一行：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/push" />
```

**效果**：编辑器里 `application.remoteNotifications` 有了补全和检查。少了这一行，`tsc` 报 `Property 'remoteNotifications' does not exist on type 'Application'`。

## 构造函数

不能用 `new` 创建：`new RemoteNotifications()` 抛 `TypeError`，信息是 `Illegal constructor: RemoteNotifications is created by the runtime, not by new`。唯一的实例从 [`application`](application.md) 的 [`remoteNotifications`](application/remotenotifications.md) 属性拿到，每次读到的是同一个对象。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`isRegistered`](remote-notifications/isregistered.md) <small>只读</small> | 这台设备现在是不是注册着这个 App 的远程推送 |
| [`token`](remote-notifications/token.md) <small>只读</small> | 这次启动以来最近一次拿到的设备令牌。还没拿到过是 `null` |

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`register()`](remote-notifications/register.md) | 向 Apple 注册，兑现成设备令牌 |
| [`unregister()`](remote-notifications/unregister.md) | 取消注册 |

还继承 [`EventTarget`](event-target.md) 的 [`addEventListener()`](event-target/addeventlistener.md)、[`removeEventListener()`](event-target/removeeventlistener.md)、[`dispatchEvent()`](event-target/dispatchevent.md)，用来监听下面的事件。

## 事件

| 事件 | 什么时候派发 |
| --- | --- |
| [`tokenchange`](remote-notifications/tokenchange-event.md) | 拿到的令牌和 `token` 原来的值不一样，包括这次启动第一次拿到。不可取消 |
| [`push`](remote-notifications/push-event.md) | 静默推送到了。事件对象是 [`PushEvent`](push-event.md)，不可取消 |

监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 示例

注册推送不涉及界面，这段代码直接写在 `main.js` 顶层就能运行。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/push" />

const push = application.remoteNotifications;

push.register().then(
  (token) => {
    console.log('令牌', token);
  },
  (err) => {
    console.log('注册失败', err instanceof Error ? err.message : String(err));
  },
);
```

**结果**

- 签名用的描述文件开着推送能力时，输出 `令牌` 和 64 个小写十六进制字符（实测）。
- 描述文件里没有推送能力时，输出 `注册失败` 和系统给的原因。中文系统上实测是 `未找到应用程序的“aps-environment”的授权字符串`。

这段代码没有作为一个整体运行过。其中用到的每个 API 都在验收用例里运行过。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIApplication sharedApplication] registerForRemoteNotifications]` | `push.register()`，返回 Promise |
| App 委托的 `application:didRegisterForRemoteNotificationsWithDeviceToken:` | `register()` 兑现成令牌。令牌是小写的十六进制字符串，不是 `NSData` |
| App 委托的 `application:didFailToRegisterForRemoteNotificationsWithError:` | `register()` 被拒绝 |
| `[[UIApplication sharedApplication] unregisterForRemoteNotifications]` | `push.unregister()` |
| `UIApplication.isRegisteredForRemoteNotifications` | `push.isRegistered` |
| App 委托的 `application:didReceiveRemoteNotification:fetchCompletionHandler:` | `push` 事件。参数 `userInfo` 是 `event.data` |
| 在上面那个方法里调 `completionHandler(UIBackgroundFetchResultNewData)` | `event.waitUntil(promise)`，结果由 Promise 决定，见 [`PushEvent`](push-event.md#系统得到的结果) |
| 设 App 委托 | 不需要，用 `addEventListener` |

## 参见

- [远程推送](../guides/push-notifications.md)：签名、把令牌交给服务器、能看见的推送、静默推送
- [`PushEvent`](push-event.md)：`push` 的事件对象
- [`UNUserNotificationCenter`](un-user-notification-center.md)：能看见的推送到了、被点了；申请展示通知的授权
- [核心和能力包](capabilities.md)：哪些能力要单独装
- [配置 App](../guides/project-config.md#写-entitlement)：`ios.entitlements` 的写法
