---
type: reference
native: UNMutableNotificationContent.body
---

# `UNMutableNotificationContent`：`body` 属性

**`body`** 属性是通知的正文。

## 值

字符串。

- 可读，可写。
- 默认值是 `''`。
- 建请求时内容被复制一份。建好请求之后再改这个属性，已经建好的请求不变。
- 只有 App 自己能改它，没有变化通知。

### 写错时

- 按字符串转：写数 `5` 得到 `'5'`。
- 写 `null` 或 `undefined` 得到空串。
- 不抛异常。

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '订单已发货';
content.body = '预计明天送达';
console.log(content.body);
```

**结果**：输出 `预计明天送达`。通知上标题下面显示这句正文（**未在模拟器验证**）。

## 对应的 iOS API

`UNMutableNotificationContent.body`。

## 参见

- [`UNNotificationContent`](../un-notification-content.md)：读出来的内容上同名的只读属性
- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md)：用内容建请求
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
