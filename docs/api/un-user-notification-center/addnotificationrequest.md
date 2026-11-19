---
type: reference
native: "-[UNUserNotificationCenter addNotificationRequest:withCompletionHandler:]"
---

# `UNUserNotificationCenter`：`addNotificationRequest()` 方法

**`addNotificationRequest()`** 方法把一条通知交给系统。请求带着触发方式的，到时候送达；不带的立刻送达。送达不需要 App 在运行。

## 语法

```
addNotificationRequest(request)
```

### 参数

**`request`**

一个 [`UNNotificationRequest`](../un-notification-request.md)，必填。

### 返回值

`Promise`，系统收下之后兑现成 `undefined`。这时通知还没有送达。

- 标识和已有的一条相同时，替换那一条。
- 系统对一个 App 同时保管的「还没到」的通知有数量上限，Apple 的文档没有给出这个数。
- 用户没有允许通知时，Promise 被拒绝，`name` 是 `'NotAllowedError'`。**未在模拟器验证。**
- 其他被拒绝的情况见[错误](../un-user-notification-center.md#错误)。

### 异常

**`TypeError`**

不带参数，或者给的不是请求，同步抛出：

```
addNotificationRequest: request must be a UNNotificationRequest, got undefined
```

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const content = new UNMutableNotificationContent();
content.title = '下载完成';
try {
  await center.addNotificationRequest(
    UNNotificationRequest.requestWithIdentifier('download-done', { content }));
  console.log('交给系统了');
} catch (err) {
  console.log('没发出去：' + /** @type {UNError} */ (err).name);
}
```

**效果**（**未在模拟器验证**）：不带 `trigger`，通知立刻送达，控制台输出 `交给系统了`。App 在前台时显不显示看 [`foregroundPresentationOptions`](foregroundpresentationoptions.md)。用户没有允许通知时输出 `没发出去：NotAllowedError`。

## 对应的 iOS API

`-[UNUserNotificationCenter addNotificationRequest:withCompletionHandler:]`。完成回调换成了 Promise。

## 参见

- [`UNNotificationRequest`](../un-notification-request.md)：建请求
- [`getPendingNotificationRequests()`](getpendingnotificationrequests.md)：查还没到的
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
