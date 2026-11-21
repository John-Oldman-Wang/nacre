---
type: reference
native: "-[UIApplicationDelegate application:didRegisterForRemoteNotificationsWithDeviceToken:]"
---

# `RemoteNotifications`：`tokenchange` 事件

**`tokenchange`** 事件在拿到的设备令牌和 [`token`](token.md) 原来的值不一样时派发，包括这次启动第一次拿到令牌。

## 语法

```
application.remoteNotifications.addEventListener('tokenchange', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target`（`application.remoteNotifications`），不带令牌：回调里读 `token` 拿新的值。不可取消。

## 什么时候派发

- 系统给了一个令牌，它和 `token` 原来的值不一样时派发。和原来一样时不派发。
- `token` 每次启动先是 `null`，所以每次启动第一次拿到令牌都派发一次。它表示「这次启动拿到的令牌和刚才不一样」，不表示「和服务器上存的不一样」：要知道服务器上的是不是最新的，App 自己记下上次交给服务器的令牌来比，见[把令牌交给服务器](../../guides/push-notifications.md#把令牌交给服务器)。
- 注册失败不派发。
- 在令牌到了之后、当前这段 JS 执行完之后派发。
- 没有监听器时不派发，之后加监听器也不补发。`token` 照样随时读得到最新的值。

以上各条在验收用例里验证过。用例里系统送来令牌的那一步是模拟的。

## 示例

```js
const push = application.remoteNotifications;
push.addEventListener('tokenchange', () => {
  console.log('新的令牌', push.token);
});
push.register().catch(() => {});
```

**效果**：签名用的描述文件开着推送能力时，输出一行 `新的令牌` 和这次拿到的令牌。

## 对应的 iOS API

App 委托的 `application:didRegisterForRemoteNotificationsWithDeviceToken:`。系统每回应一次注册就调一次那个方法；这里只在令牌变了时派发。

## 参见

- [`token`](token.md)、[`register()`](register.md)
- 这个类属于 `@nacrejs/push` 包，装法见[要先安装](../remote-notifications.md#要先安装)
