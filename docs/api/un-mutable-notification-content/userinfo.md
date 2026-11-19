---
type: reference
native: UNMutableNotificationContent.userInfo
---

# `UNMutableNotificationContent`：`userInfo` 属性

**`userInfo`** 属性是跟着通知走的数据，用户看不到。通知被点了之后从 [`notificationclick`](../un-user-notification-center/notificationclick-event.md) 事件里原样拿回来。

## 值

对象。

- 可读，可写。
- 默认值是 `{}`。
- 写进去的是一份副本，之后改原来的对象不影响内容。
- 读出来的对象是冻结的，改它抛 `TypeError`。
- 值只能是字符串、有限的数、布尔、数组和普通对象，可以嵌套。
- 建请求时内容被复制一份。建好请求之后再改这个属性，已经建好的请求不变。
- 只有 App 自己能改它，没有变化通知。

### 写错时

- 写 `null` 或 `undefined` 等于写 `{}`。
- 值是 `undefined` 的键被略过。
- 不是普通对象时抛 `TypeError`：`userInfo must be a plain object, got "A1024"`。
- 里面有 `null`、`Date`、函数时抛 `TypeError`，报错里写明是哪一个：`userInfo.a.b must be a string, number, boolean, array or plain object, got null`。
- 里面有 `NaN`、`Infinity` 时抛 `TypeError`：`userInfo.a must be a finite number, got NaN`。
- 对象引用了包含它的对象（循环）时抛 `TypeError`。

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '订单已发货';
content.userInfo = { screen: 'order', orderId: 'A1024' };
console.log(Object.isFrozen(content.userInfo), content.userInfo.orderId);
```

**结果**：输出 `true A1024`。用户点了这条通知，`notificationclick` 事件里 `response.notification.request.content.userInfo.orderId` 是 `'A1024'`（**未在模拟器验证**）。

## 对应的 iOS API

`UNMutableNotificationContent.userInfo`。

## 参见

- [`UNNotificationContent`](../un-notification-content.md)：读出来的内容上同名的只读属性
- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md)：用内容建请求
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
