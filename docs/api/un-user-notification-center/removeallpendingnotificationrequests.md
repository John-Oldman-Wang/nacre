---
type: reference
native: "-[UNUserNotificationCenter removeAllPendingNotificationRequests]"
---

# `UNUserNotificationCenter`：`removeAllPendingNotificationRequests()` 方法

**`removeAllPendingNotificationRequests()`** 方法撤销这个 App 全部还没送达的通知。

## 语法

```
removeAllPendingNotificationRequests()
```

### 参数

无。

### 返回值

无（`undefined`）。

系统在后台执行撤销，方法立刻返回。紧接着调 [`getPendingNotificationRequests()`](getpendingnotificationrequests.md) 可能还看得到被撤销的通知。

### 异常

无。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.removeAllPendingNotificationRequests();
```

**效果**（**未在模拟器验证**）：之前交给系统、还没到的通知都不再送达。已经送达的不受影响。

## 对应的 iOS API

`-[UNUserNotificationCenter removeAllPendingNotificationRequests]`。

## 参见

- [`removePendingNotificationRequestsWithIdentifiers()`](removependingnotificationrequestswithidentifiers.md)：按标识撤销
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
