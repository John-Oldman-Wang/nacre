---
type: reference
native: UNNotificationSound
status: partial
---

# `UNNotificationSound`

**`UNNotificationSound`** 表示通知到的时候播放的声音。现在只有系统默认的那一个：[`UNNotificationSound.defaultSound`](un-notification-sound/defaultsound.md)。不要声音就把内容的 `sound` 留成 `null`。

从远程推送的通知里读出来的 `sound` 可能是另一个 `UNNotificationSound`：它表示服务器指定了别的声音文件，读不出文件名（**未在模拟器验证**）。

它是普通的 JS 值，不继承 `NSObject`。

要先装 `@nacrejs/user-notifications`，装法见 [`UNUserNotificationCenter`](un-user-notification-center.md#要先安装)，也可以看[核心和能力包](capabilities.md)。

**继承关系**：`UNNotificationSound`

## 构造函数

不能用 `new` 创建。`new UNNotificationSound()` 抛 `TypeError`：

```
Illegal constructor: UNNotificationSound cannot be constructed; use UNNotificationSound.defaultSound
```

## 静态属性

[`UNNotificationSound.defaultSound`](un-notification-sound/defaultsound.md) <small>只读</small>

系统默认的通知声音。每次读是同一个对象。

## 示例

```js
const content = new UNMutableNotificationContent();
content.title = '有新消息';
content.sound = UNNotificationSound.defaultSound;
```

**效果**：用这份内容发的通知送达时播放系统默认的通知声音。**未在模拟器验证。**

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `UNNotificationSound.defaultSound` | `UNNotificationSound.defaultSound` |

## 参见

- [`sound`](un-mutable-notification-content/sound.md)：声音写在内容的这个属性里
