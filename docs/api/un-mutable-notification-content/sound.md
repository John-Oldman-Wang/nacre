---
type: reference
native: UNMutableNotificationContent.sound
---

# `UNMutableNotificationContent`：`sound` 属性

**`sound`** 属性是通知送达时播放的声音。

## 值

[`UNNotificationSound`](../un-notification-sound.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`：不响。
- 只能写 `UNNotificationSound.defaultSound`（系统默认的通知声音）或 `null`（不响）。
- App 在前台时，送达的通知播不播声音还要看 [`foregroundPresentationOptions`](../un-user-notification-center/foregroundpresentationoptions.md) 里有没有 `'sound'`。
- 建请求时内容被复制一份。建好请求之后再改这个属性，已经建好的请求不变。
- 只有 App 自己能改它，没有变化通知。

### 写错时

- 写 `null` 或 `undefined` 得到 `null`。
- 别的值抛 `TypeError`：`sound must be UNNotificationSound.defaultSound or null, got "default"`。
- 写从远程推送的通知里读出来的那种声音也抛：`sound must be UNNotificationSound.defaultSound or null, got a sound that came from a delivered notification`。

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '有新消息';
content.sound = UNNotificationSound.defaultSound;
console.log(content.sound === UNNotificationSound.defaultSound);
```

**结果**：输出 `true`。用这份内容发的通知送达时播放系统默认的通知声音（**未在模拟器验证**）。

## 对应的 iOS API

`UNMutableNotificationContent.sound`。

## 参见

- [`UNNotificationContent`](../un-notification-content.md)：读出来的内容上同名的只读属性
- [`UNNotificationRequest.requestWithIdentifier()`](../un-notification-request/requestwithidentifier.md)：用内容建请求
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
