---
type: reference
native: "-[UIApplicationDelegate application:didRegisterForRemoteNotificationsWithDeviceToken:]"
---

# `RemoteNotifications`：`token` 属性

**`token`** 属性是这次启动以来最近一次拿到的设备令牌。

## 值

字符串或 `null`。

| 取值 | 含义 |
| --- | --- |
| 字符串 | 最近一次拿到的令牌，小写的十六进制，和 [`register()`](register.md) 兑现的值相同（实测） |
| `null` | 这次启动以来还没拿到过令牌 |

- 只读。给它赋值抛 `TypeError`。
- 它只记这次启动以来的值。每次启动 App，它先是 `null`，直到 `register()` 拿到令牌。
- 注册失败不改它（实测）。[`unregister()`](unregister.md) 也不改它（读代码得出）。

### 怎么得知它变了

拿到的令牌和它原来的值不一样时，派发 [`tokenchange`](tokenchange-event.md)。

## 示例

```js
const push = application.remoteNotifications;
console.log(push.token);
push.register().then(() => {
  console.log(push.token);
}, () => {});
```

**效果**：先输出 `null`。签名用的描述文件开着推送能力时，接着输出 64 个小写十六进制字符组成的令牌。

## 对应的 iOS API

App 委托的 `application:didRegisterForRemoteNotificationsWithDeviceToken:` 给的 `deviceToken`。ObjC 里它是 `NSData`，这里是它的十六进制写法。`UIApplication` 上没有读令牌的属性。

## 参见

- [`register()`](register.md)、[`tokenchange`](tokenchange-event.md)
- 这个类属于 `@nacrejs/push` 包，装法见[要先安装](../remote-notifications.md#要先安装)
