---
type: reference
native: UNMutableNotificationContent.threadIdentifier
---

# `UNMutableNotificationContent`：`threadIdentifier` 属性

**`threadIdentifier`** 属性是分组的标识。通知中心把这个值相同的通知叠成一组。

## 值

字符串。

- 可读，可写。
- 默认值是 `''`：不指定，按 App 分组。
- 分组在屏幕上的样子**未在模拟器验证**。
- 建请求时内容被复制一份。建好请求之后再改这个属性，已经建好的请求不变。
- 只有 App 自己能改它，没有变化通知。

### 写错时

- 按字符串转：写数 `5` 得到 `'5'`。
- 写 `null` 或 `undefined` 得到空串。
- 不抛异常。

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '张三：晚上吃什么';
content.threadIdentifier = 'chat-zhangsan';
```

**效果**：同一个会话的通知在通知中心里叠成一组（**未在模拟器验证**）。

## 对应的 iOS API

`UNMutableNotificationContent.threadIdentifier`。

## 参见

- [`UNNotificationContent`](../un-notification-content.md)：读出来的内容上同名的只读属性
- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md)：用内容建请求
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
