---
type: reference
native: "-[UNUserNotificationCenter setBadgeCount:withCompletionHandler:]"
---

# `UNUserNotificationCenter`：`setBadgeCount()` 方法

**`setBadgeCount()`** 方法把 App 图标右上角的数字（角标）改成指定的数。

## 语法

```
setBadgeCount(count)
```

### 参数

**`count`**

不小于 0 的整数（个数）。小数向零取整，看起来像数的字符串按数转。`0` 是去掉数字。

### 返回值

`Promise`，改好之后兑现成 `undefined`。

用户没有允许角标时系统怎么答复，**未在模拟器验证**。

### 异常

**`TypeError`**

同步抛出：

| 写法 | 报错信息 |
| --- | --- |
| 负数，`-1` | `setBadgeCount: count must not be negative, got -1` |
| 转不成有限的数，`'many'` | `setBadgeCount: count must be a finite number, got "many"` |

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
await center.setBadgeCount(3);
```

**效果**（**未在模拟器验证**）：App 图标右上角显示 3。

## 对应的 iOS API

`-[UNUserNotificationCenter setBadgeCount:withCompletionHandler:]`。完成回调换成了 Promise。

## 参见

- [`badge`](../un-mutable-notification-content/badge.md)：通知送达时改角标
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
