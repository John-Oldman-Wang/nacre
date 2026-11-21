---
type: reference
native: UIApplication.isRegisteredForRemoteNotifications
---

# `RemoteNotifications`：`isRegistered` 属性

**`isRegistered`** 属性表示这台设备现在是不是注册着这个 App 的远程推送。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 注册着。[`register()`](register.md) 兑现之后是这个值（实测） |
| `false` | 没注册着。[`unregister()`](unregister.md) 之后是这个值（实测） |

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是系统这一刻的状态。

### 怎么得知它变了

没有变化事件。它跟着 App 自己调的 `register()` 和 `unregister()` 变：`register()` 兑现之后、`unregister()` 返回之后再读，得到的就是新的值。

不要用它决定要不要调 `register()`。每次启动都调 `register()`，拿到这次的令牌。

## 示例

```js
const push = application.remoteNotifications;
push.register().then(() => {
  console.log(push.isRegistered);
}, () => {});
```

**效果**：签名用的描述文件开着推送能力时，输出 `true`（实测）。

## 对应的 iOS API

`UIApplication.isRegisteredForRemoteNotifications`。

## 参见

- [`register()`](register.md)、[`unregister()`](unregister.md)
- 这个类属于 `@nacrejs/push` 包，装法见[要先安装](../remote-notifications.md#要先安装)
