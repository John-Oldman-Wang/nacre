---
type: reference
native: "-[UIApplication unregisterForRemoteNotifications]"
---

# `RemoteNotifications`：`unregister()` 方法

**`unregister()`** 方法取消这台设备上这个 App 的远程推送注册。之后这台设备收不到这个 App 的远程推送，直到再调 [`register()`](register.md)。

## 语法

```
unregister()
```

### 参数

无。

### 返回值

无（`undefined`）。

调用之后，[`isRegistered`](isregistered.md) 是 `false`（实测）。[`token`](token.md) 不变，仍然是最近一次拿到的令牌（读代码得出）。

### 异常

无。

## 说明

Apple 的文档建议只在很少的情况下调它，比如 App 的新版本完全不再用推送。用户退出登录、不想再收某个账号的推送时，常见的做法是让服务器删掉这台设备的令牌，App 保持注册。用户自己不想看到通知时，可以在系统的「设置」里关掉。

## 示例

```js
const push = application.remoteNotifications;
push.unregister();
console.log(push.isRegistered);
```

**效果**：输出 `false`（实测）。

## 对应的 iOS API

`-[UIApplication unregisterForRemoteNotifications]`。

## 参见

- [`register()`](register.md)、[`isRegistered`](isregistered.md)
- 这个类属于 `@nacrejs/push` 包，装法见[要先安装](../remote-notifications.md#要先安装)
