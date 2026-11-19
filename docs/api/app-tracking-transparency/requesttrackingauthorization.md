---
type: reference
native: "+[ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:]"
---

# `ATTrackingManager.requestTrackingAuthorization()` 静态方法

**`ATTrackingManager.requestTrackingAuthorization()`** 静态方法向用户申请跟踪授权，返回一个 Promise，兑现成申请之后的授权状态。

## 语法

```
ATTrackingManager.requestTrackingAuthorization()
```

### 参数

无。

### 返回值

`Promise`，兑现成申请之后的授权状态：`'notDetermined'`、`'restricted'`、`'denied'`、`'authorized'` 之一，见[四种授权状态](../app-tracking-transparency.md#四种授权状态)。

状态是 `'notDetermined'` 时，系统弹出提示框。提示框的标题和两个按钮由系统提供，App 能决定的只有标题下面那句说明（`NSUserTrackingUsageDescription`）。用户点了按钮之后 Promise 兑现，值是 `'authorized'` 或 `'denied'`。

下面几种情况系统不弹出提示框，Promise 立刻兑现成当时的状态：

| 情况 | 说明 |
| --- | --- |
| 用户已经答复过 | 状态是 `'authorized'` 或 `'denied'` |
| 设备受限 | 状态是 `'restricted'` |
| 用户在系统的「设置 → 隐私与安全性 → 跟踪」里关掉了「允许 App 请求跟踪」 | 所有 App 都不能申请 |
| App 不在活动状态 | [`application.state`](../application.md#前台后台和运行状态) 不是 `'active'`，比如 App 刚启动、界面还没显示出来 |
| 上一次申请还在等用户答复 | 提示框正显示着 |

提示框和这张表来自 Apple 的文档，**未在模拟器验证**。

一个 App 只有一次弹出提示框的机会：用户答复之后，再申请也不会弹出。

### 异常

不同步抛出异常。失败时 Promise 被拒绝，值是一个 `TypeError`：

- App 的 Info.plist 里没有 `NSUserTrackingUsageDescription`：`requestTrackingAuthorization needs NSUserTrackingUsageDescription in Info.plist; without it the system terminates the app`。用 CLI 生成的工程不会走到这里：缺这句说明时生成就已经报错了。它是给自己搭 Xcode 工程、把 framework 拖进去的情况准备的。
- 系统答复了一个运行时不认识的状态（系统以后新增了状态）：`requestTrackingAuthorization: the system answered with a status this runtime does not know (…)`，括号里是系统给的数值。

## 示例

```js
ATTrackingManager.requestTrackingAuthorization().then(
  (status) => {
    console.log(status);
  },
  (err) => {
    console.log('申请没有发出去：' + err.message);
  },
);
```

**效果**：状态是 `'notDetermined'` 时弹出系统的提示框，用户答复后输出 `authorized` 或 `denied`；其余情况不弹出提示框，输出现在的状态。Info.plist 里没有 `NSUserTrackingUsageDescription` 时走第二个回调。**未在模拟器验证。**

## 对应的 iOS API

`+[ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:]`。完成回调换成了 Promise。

## 参见

- [`trackingAuthorizationStatus`](trackingauthorizationstatus.md)：读现在的状态，不弹提示框
- [申请跟踪授权](../../guides/tracking-authorization.md)：什么时候申请
- [安装 `@nacrejs/app-tracking-transparency`](../app-tracking-transparency.md#先装上)
