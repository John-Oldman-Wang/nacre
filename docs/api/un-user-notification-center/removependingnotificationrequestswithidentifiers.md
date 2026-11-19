---
type: reference
native: "-[UNUserNotificationCenter removePendingNotificationRequestsWithIdentifiers:]"
---

# `UNUserNotificationCenter`：`removePendingNotificationRequestsWithIdentifiers()` 方法

**`removePendingNotificationRequestsWithIdentifiers()`** 方法按标识撤销还没送达的通知。

## 语法

```
removePendingNotificationRequestsWithIdentifiers(identifiers)
```

### 参数

**`identifiers`**

字符串的数组，必填。里面的值按字符串转。没有这个标识的通知不报错。

### 返回值

无（`undefined`）。

系统在后台执行撤销，方法立刻返回。紧接着调 [`getPendingNotificationRequests()`](getpendingnotificationrequests.md) 可能还看得到被撤销的那几条。

### 异常

**`TypeError`**

不是数组：`removePendingNotificationRequestsWithIdentifiers: identifiers must be an array of strings, got "order-1"`。

## 说明

要改一条还没到的通知，不用先撤销：再交一条标识相同的请求，系统用新的替换旧的。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.removePendingNotificationRequestsWithIdentifiers(['water-reminder']);
```

**效果**（**未在模拟器验证**）：标识是 `water-reminder` 的那条不再送达。没有这个标识也不报错。

## 对应的 iOS API

`-[UNUserNotificationCenter removePendingNotificationRequestsWithIdentifiers:]`。

## 参见

- [`removeAllPendingNotificationRequests()`](removeallpendingnotificationrequests.md)：撤销全部
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
