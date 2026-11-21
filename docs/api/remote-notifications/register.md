---
type: reference
native: "-[UIApplication registerForRemoteNotifications]"
---

# `RemoteNotifications`：`register()` 方法

**`register()`** 方法向 Apple 的推送服务注册这台设备上的这个 App，兑现成设备令牌。

## 语法

```
register()
```

### 参数

无。

### 返回值

`Promise<string>`。

**兑现**成设备令牌：小写的十六进制字符串。服务器给这台设备发推送时要带上它。

- 实测的令牌是 32 字节，写成 64 个字符。Apple 的文档说令牌的长度不固定，所以不要按固定的长度校验它。
- 兑现之后，[`token`](token.md) 是这个令牌，[`isRegistered`](isregistered.md) 是 `true`（实测）。
- 同时调用几次，系统只注册一次，几个 Promise 兑现成同一个结果（实测）。
- 每次重新安装 App，拿到的令牌都不一样（实测）。

**拒绝**时给的是一个 `Error`，`message` 是系统给的原因，跟着手机的语言。最常见的是签名用的描述文件里没有推送能力，中文系统上实测的原文是：

```
未找到应用程序的“aps-environment”的授权字符串
```

注册失败不改 `token`（实测）。

系统一直不回应时，Promise 一直等着，运行时不设超时（读代码得出）。

### 异常

无。

## 说明

- 注册不弹提示框，不需要用户同意。
- 拿到令牌只表示服务器能给这台设备发推送。能看见的推送（横幅、声音）要展示出来，还要用户同意这个 App 发通知，申请用 `@nacrejs/user-notifications` 的 [`requestAuthorizationWithOptions()`](../un-user-notification-center/requestauthorizationwithoptions.md)。静默推送不需要用户同意。这两条来自 Apple 的文档，**未在真机验证**。
- 令牌在这次启动以后才有，运行时不替 App 保存它。每次启动都调一次 `register()`，把拿到的交给服务器。

## 示例

```js
const push = application.remoteNotifications;
push.register().then(
  (token) => {
    console.log(token.length, token === push.token);
  },
  (err) => {
    console.log('注册失败', err instanceof Error ? err.message : String(err));
  },
);
```

**效果**：签名用的描述文件开着推送能力时，输出 `64 true`（实测）。没有推送能力时，输出 `注册失败` 和系统给的原因。

## 对应的 iOS API

`-[UIApplication registerForRemoteNotifications]`。结果在 ObjC 里由 App 委托的两个方法报告：`application:didRegisterForRemoteNotificationsWithDeviceToken:` 给 `NSData` 形式的令牌，`application:didFailToRegisterForRemoteNotificationsWithError:` 给错误。这里合成一个 Promise，令牌转成十六进制字符串。

## 参见

- [`token`](token.md)、[`tokenchange`](tokenchange-event.md)
- [远程推送](../../guides/push-notifications.md#把令牌交给服务器)：把令牌交给服务器
- 这个类属于 `@nacrejs/push` 包，装法见[要先安装](../remote-notifications.md#要先安装)
