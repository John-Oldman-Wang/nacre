---
type: reference
native: UNNotificationResponse.actionIdentifier
---

# `UNNotificationResponse`：`actionIdentifier` 属性

**`actionIdentifier`** 属性表示用户对通知做了什么。

## 值

字符串：

| 取值 | 含义 |
| --- | --- |
| `'default'` | 用户点了通知，App 被打开 |
| `'dismiss'` | 用户把通知划掉了。系统只对登记了分类、并且分类要求报告划掉的通知报这个；分类这个包还不能登记，所以用这个包发的通知划掉时没有事件 |
| 其他字符串 | 通知上自定义按钮的标识，原样给出。自定义按钮这个包还不能登记 |

- 只读。给它赋值抛 `TypeError`：`actionIdentifier is read-only`。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
center.addEventListener('notificationclick', (event) => {
  if (event.response.actionIdentifier === 'default') {
    console.log('用户点了通知');
  }
});
```

**效果**（**未在模拟器验证**）：用户点一条通知，输出 `用户点了通知`。

## 对应的 iOS API

`UNNotificationResponse.actionIdentifier`。`UNNotificationDefaultActionIdentifier` 写成 `'default'`，`UNNotificationDismissActionIdentifier` 写成 `'dismiss'`。

## 参见

- [`notificationclick`](../un-user-notification-center/notificationclick-event.md)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
