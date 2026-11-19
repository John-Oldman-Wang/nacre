---
type: reference
native: "-[UNUserNotificationCenter getPendingNotificationRequestsWithCompletionHandler:]"
---

# `UNUserNotificationCenter`：`getPendingNotificationRequests()` 方法

**`getPendingNotificationRequests()`** 方法读已经交给系统、还没送达的通知。

## 语法

```
getPendingNotificationRequests()
```

### 参数

无。

### 返回值

`Promise`，兑现成 [`UNNotificationRequest`](../un-notification-request.md) 的数组。

- 立刻送达的通知（没有 `trigger`）不会出现在这里（**未在模拟器验证**）。
- 读回来的请求和当初交出去的那个不是同一个对象，内容相同。比较用 `identifier`。
- 刚撤销的通知可能还在里面，见 [`removePendingNotificationRequestsWithIdentifiers()`](removependingnotificationrequestswithidentifiers.md)。

### 异常

无。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const requests = await center.getPendingNotificationRequests();
console.log(requests.map((request) => request.identifier).join(', '));
```

**效果**（**未在模拟器验证**）：输出所有还没到的通知的标识。

## 对应的 iOS API

`-[UNUserNotificationCenter getPendingNotificationRequestsWithCompletionHandler:]`。完成回调换成了 Promise。

## 参见

- [`UNNotificationTrigger`](../un-notification-trigger.md)：用 `instanceof` 分辨触发方式
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
