---
type: reference
native: "-[UNUserNotificationCenter requestAuthorizationWithOptions:completionHandler:]"
---

# `UNUserNotificationCenter`：`requestAuthorizationWithOptions()` 方法

**`requestAuthorizationWithOptions()`** 方法问用户同不同意这个 App 发通知。

## 语法

```
requestAuthorizationWithOptions(options)
```

### 参数

**`options`**

名字的数组，必填，可以是空数组。要申请哪几样：

| 名字 | 申请什么 |
| --- | --- |
| `'alert'` | 展示通知：横幅、锁屏、通知中心 |
| `'sound'` | 播放声音 |
| `'badge'` | 改图标上的数字 |
| `'carPlay'` | 在 CarPlay（车载屏幕）上展示 |
| `'provisional'` | 临时授权：不弹提示框，直接兑现 `true`，但通知只安静地进通知中心，没有横幅和声音，用户在那里选择保留还是关掉。**未在模拟器验证** |
| `'criticalAlert'` | 紧急通知：无视静音和勿扰模式。需要苹果单独批准的权限，没有时这一项不生效。**未在模拟器验证** |
| `'providesAppNotificationSettings'` | 告诉系统这个 App 有自己的通知设置页，系统会在它的通知设置里加一个按钮。按钮被点的通知这个包还没有接 |

通常写 `['alert', 'sound', 'badge']`。

### 返回值

`Promise`，兑现成布尔：`true` 是同意，`false` 是拒绝。

- **提示框只出现一次。** 第一次调用时系统弹出提示框，用户选完之后兑现。之后再调不会再弹，直接兑现成现在的结果。所以每次要发通知之前都调一次是安全的。**未在模拟器验证。**
- **用户拒绝之后，App 没有办法再弹提示框。** 只有用户自己去系统的「设置」里改。
- 系统报告失败时 Promise 被拒绝，见[错误](../un-user-notification-center.md#错误)。

### 异常

**`TypeError`**

参数写错时同步抛出，不返回被拒绝的 Promise，也不弹提示框：

| 写法 | 报错信息 |
| --- | --- |
| 不带参数 | `requestAuthorizationWithOptions: options must be an array of names, got undefined` |
| 不认识的名字，`['alert', 'popup']` | `requestAuthorizationWithOptions has no value "popup"; expected one of: badge / sound / alert / carPlay / criticalAlert / providesAppNotificationSettings / provisional` |

## 说明

什么时候申请由 App 决定。推荐在用户做了一件明显需要通知的事时再申请（设了一个提醒、下了一个订单），不要一启动就弹：用户还不知道这个 App 会发什么，多半会拒绝，而拒绝之后不能再问。

只想知道现在的状态、不想弹提示框，用 [`getNotificationSettings()`](getnotificationsettings.md)。

## 示例

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const granted = await center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
console.log(granted);
```

**效果**（**未在模拟器验证**）：还没问过时系统弹出提示框，用户选完之后输出 `true` 或 `false`。已经问过时当场输出现在的结果。

## 对应的 iOS API

`-[UNUserNotificationCenter requestAuthorizationWithOptions:completionHandler:]`。选项在 ObjC 里是位掩码 `UNAuthorizationOptionAlert | UNAuthorizationOptionSound`，这里写成数组 `['alert', 'sound']`；完成回调换成了 Promise。

## 参见

- [`getNotificationSettings()`](getnotificationsettings.md)：只读状态，不弹提示框
- [发本地通知](../../guides/local-notifications.md#用户同不同意)
- 这个类属于 `@nacrejs/user-notifications` 包，装法见[要先安装](../un-user-notification-center.md#要先安装)
