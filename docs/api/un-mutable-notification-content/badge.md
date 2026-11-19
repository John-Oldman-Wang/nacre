---
type: reference
native: UNMutableNotificationContent.badge
---

# `UNMutableNotificationContent`：`badge` 属性

**`badge`** 属性是通知送达时把 App 图标右上角的数字（角标）改成几。

## 值

整数（个数），或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- `0`：送达时去掉图标上的数字。
- `null`：送达时不改图标上的数字。
- 送达时的效果**未在模拟器验证**。
- 建请求时内容被复制一份。建好请求之后再改这个属性，已经建好的请求不变。
- 只有 App 自己能改它，没有变化通知。

### 写错时

- 看起来像数的字符串按数转，小数向零取整：写 `'3'` 得到 `3`，写 `2.9` 得到 `2`。
- 写 `null` 或 `undefined` 得到 `null`。
- 负数抛 `TypeError`：`badge must not be negative, got -1`。
- 转不出数的抛 `TypeError`：`badge must be a finite number, got "many"`。

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '3 条新消息';
content.badge = 3;
console.log(content.badge);
```

**结果**：输出 `3`。用这份内容发的通知送达时，App 图标右上角显示 3（**未在模拟器验证**）。

## 对应的 iOS API

`UNMutableNotificationContent.badge`。

## 参见

- [`UNNotificationContent`](../un-notification-content.md)：读出来的内容上同名的只读属性
- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md)：用内容建请求
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
