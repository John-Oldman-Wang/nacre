---
type: reference
native: UNNotificationSound.defaultSound
---

# `UNNotificationSound.defaultSound` 静态属性

**`UNNotificationSound.defaultSound`** 静态属性是系统默认的通知声音。

## 值

`UNNotificationSound`。

- 只读。给它赋值抛 `TypeError`：`defaultSound is read-only`。
- 每次读是同一个对象，可以用 `===` 比。
- 它是内容的 [`sound`](../un-mutable-notification-content/sound.md) 唯一能写的声音。

## 示例

```js
const content = new UNMutableNotificationContent();
content.sound = UNNotificationSound.defaultSound;
console.log(content.sound === UNNotificationSound.defaultSound);
```

**结果**：输出 `true`。用这份内容发的通知送达时播放系统默认的通知声音（**未在模拟器验证**）。

## 对应的 iOS API

`UNNotificationSound.defaultSound`。

## 参见

- [`sound`](../un-mutable-notification-content/sound.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
