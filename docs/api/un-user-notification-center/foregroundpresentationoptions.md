---
type: reference
native: "-[UNUserNotificationCenterDelegate userNotificationCenter:willPresentNotification:withCompletionHandler:]"
---

# `UNUserNotificationCenter`：`foregroundPresentationOptions` 属性

**`foregroundPresentationOptions`** 属性决定 App 在前台（用户正在用它）时到的通知怎么展示。

## 值

名字的数组，可以同时写几个：

| 名字 | 效果 |
| --- | --- |
| `'banner'` | 屏幕顶上滑下一条横幅 |
| `'list'` | 留在通知中心里 |
| `'sound'` | 播放内容里的 `sound`。内容的 `sound` 是 `null` 时没有声音 |
| `'badge'` | 把图标上的数字改成内容里的 `badge`。内容的 `badge` 是 `null` 时不改 |

- 可读，可写。
- 默认值是 `[]`：**不展示**，没有横幅，没有声音，通知中心里也没有。这时 App 从 [`notification`](notification-event.md) 事件得知到了通知，可以在自己的界面上处理。
- 写了几样，App 开着时到的通知就照这几样展示；`notification` 事件照常派发。
- 读出来是一个新的数组，按 `badge`、`sound`、`list`、`banner` 的先后排，和写进去的先后无关；重复写的名字只算一次。修改读出来的数组不影响设置。
- 对所有通知生效，不能只对某一条或某一类生效。
- 只有 App 自己能改它，没有变化通知。
- 值只存在内存里，App 每次启动都是 `[]`，所以每次启动都要设。推荐在 `application` 的 `sceneconnect` 回调里设：界面出现之前它一定执行过。
- 屏幕上的效果**未在模拟器验证**。

这个属性是**预先设好**的：通知到的那一刻系统按它的值处理，不等 JS 的事件监听器。所以不能在 `notification` 的监听器里决定这一条显不显示，那时已经定了。要按当时的界面决定，在界面变化的时候改这个属性。

### 写错时

- 数组里有不认识的名字时（比如 `['banner', 'popup']`）不抛异常：整次赋值不生效，原来的值不变，控制台输出一条警告。数组里写对的名字不会被单独应用：

  ```
  [Nacre] foregroundPresentationOptions has no value "popup"; expected one of: badge / sound / list / banner, ignored
  ```

- 给的不是数组时抛 `TypeError`，原来的值不变：

  | 写法 | 报错信息 |
  | --- | --- |
  | 不是数组，`'banner'` | `foregroundPresentationOptions must be an array of names, got "banner"` |
  | `null`、`undefined` | `foregroundPresentationOptions must be an array of names, got null` |

> **注意**：赋值要写在函数里面。写在 JS 文件的最外层时，类型检查（TypeScript 5.9.3）把右边的数组当成普通的字符串数组，报 `Type 'string[]' is not assignable to type 'UNNotificationPresentationOptions[]'`。运行不受影响。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
application.addEventListener('sceneconnect', () => {
  center.foregroundPresentationOptions = ['banner', 'list', 'sound'];
  console.log(center.foregroundPresentationOptions.join(', '));
});
```

**效果**：控制台输出 `sound, list, banner`。之后 App 开着时到的通知，顶上滑下横幅，播放声音，并且留在通知中心里（**未在模拟器验证**）。

## 对应的 iOS API

ObjC 里没有这个属性。系统在通知到的那一刻调委托的 `userNotificationCenter:willPresentNotification:withCompletionHandler:` 来问，App 在里面调 `completionHandler(UNNotificationPresentationOptionBanner | UNNotificationPresentationOptionSound)`。JS 这边预先设 `center.foregroundPresentationOptions = ['banner', 'sound']`，系统来问时按它回答。原因见[实现原理](../../internals/user-notifications.md#前台显示是预先设的)。

## 参见

- [`notification`](notification-event.md)：App 在前台时到了通知
- [发本地通知](../../guides/local-notifications.md#按当前界面决定显不显示)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
