---
type: reference
native: +[UNUserNotificationCenter currentNotificationCenter]
---

# `UNUserNotificationCenter.currentNotificationCenter()` 静态方法

**`UNUserNotificationCenter.currentNotificationCenter()`** 静态方法返回这个 App 的通知中心。

## 语法

```
UNUserNotificationCenter.currentNotificationCenter()
```

### 参数

无。

### 返回值

`UNUserNotificationCenter`。每次调用得到同一个对象。

运行时一直保留着它，挂在它上面的监听器不会丢，不用自己存。

### 异常

无。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
console.log(center === UNUserNotificationCenter.currentNotificationCenter());
```

**结果**：输出 `true`。

## 对应的 iOS API

`+[UNUserNotificationCenter currentNotificationCenter]`。头文件里它是类方法，不是类属性，所以带括号。

## 参见

- [`UNUserNotificationCenter`](../un-user-notification-center.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
