---
type: reference
native: "-[UIApplicationDelegate application:didReceiveRemoteNotification:fetchCompletionHandler:] userInfo"
---

# `PushEvent`：`data` 属性

**`data`** 属性是这条静默推送的内容：服务器发来的整个 JSON 对象，包括 `aps`。

## 值

普通的 JS 对象。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是同一个对象。
- 内容是服务器发出的那个 JSON 对象，原样：`aps` 是系统用的部分，其余的键是服务器自己放的数据（实测，推送到达的那一步是模拟的）。

服务器发出：

```json
{ "aps": { "content-available": 1 }, "orderId": 42 }
```

**效果**：`event.data.orderId` 是 `42`，`event.data.aps` 是 `{ 'content-available': 1 }`。

## 示例

```js
const push = application.remoteNotifications;
push.addEventListener('push', (event) => {
  const orderId = event.data.orderId;
  if (typeof orderId === 'number') {
    console.log('订单有变化', orderId);
  }
});
```

**效果**：收到上面那条推送时，输出 `订单有变化 42`。推送到达**未在真机验证**。

## 对应的 iOS API

`application:didReceiveRemoteNotification:fetchCompletionHandler:` 的参数 `userInfo`。

## 参见

- [`PushEvent`](../push-event.md)
- [远程推送](../../guides/push-notifications.md#服务器怎么发)：推送的内容怎么写
