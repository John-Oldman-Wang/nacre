---
type: reference
native: "+[UNNotificationRequest requestWithIdentifier:content:trigger:]"
---

# `UNNotificationRequest.requestWithIdentifier()` 静态方法

**`UNNotificationRequest.requestWithIdentifier()`** 静态方法用标识、内容和触发方式建一个请求。

## 语法

```
UNNotificationRequest.requestWithIdentifier(identifier, { content[, trigger] })
```

### 参数

**`identifier`**

这条通知的标识，按字符串转。之后按它撤销；再交一条标识相同的请求，会替换掉原来那条。

**`options.content`**

必填。一个 [`UNMutableNotificationContent`](../un-mutable-notification-content.md)，或者从别的请求里读出来的 [`UNNotificationContent`](../un-notification-content.md)。内容在这里被复制一份。

**`options.trigger`**

可选。[`UNTimeIntervalNotificationTrigger`](../un-time-interval-notification-trigger.md) 或 [`UNCalendarNotificationTrigger`](../un-calendar-notification-trigger.md)。不带或者是 `null`，通知立刻送达。

### 返回值

新的 `UNNotificationRequest`。它的 [`content`](content.md) 是内容在这一刻的只读副本：之后改原来的内容，请求里的不变。

### 异常

**`TypeError`**

| 写法 | 报错信息 |
| --- | --- |
| 没有 `content` | `requestWithIdentifier needs { content }` |
| `content` 是普通对象 | `requestWithIdentifier: content must be a UNNotificationContent, got an object` |
| `content` 带着从远程推送的通知里读出来的、不是默认的声音 | `requestWithIdentifier: this content carries a sound that came from a delivered notification and cannot be scheduled again` |
| `trigger` 不是触发器，`5` | `requestWithIdentifier: trigger must be a UNTimeIntervalNotificationTrigger, a UNCalendarNotificationTrigger or null, got 5` |
| `trigger` 是 `UNPushNotificationTrigger` 一类不能排的触发器 | `requestWithIdentifier: trigger must be a UNTimeIntervalNotificationTrigger, a UNCalendarNotificationTrigger or null, got a trigger that cannot be scheduled` |

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '第一条';
const first = UNNotificationRequest.requestWithIdentifier('a', { content });
content.title = '第二条';
const second = UNNotificationRequest.requestWithIdentifier('b', {
  content,
  trigger: UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(60),
});
console.log(first.content.title, second.content.title, first.trigger);
```

**结果**：输出 `第一条 第二条 null`。同一个内容对象改一改，可以再建下一个请求，前一个请求不受影响。

## 对应的 iOS API

`+[UNNotificationRequest requestWithIdentifier:content:trigger:]`。`content:` 和 `trigger:` 两段换成了 options 的键。

## 参见

- [`addNotificationRequest()`](../un-user-notification-center/addnotificationrequest.md)：把请求交给系统
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
