---
type: reference
native: UNUserNotificationCenter
status: partial
---

# `UNUserNotificationCenter`

**`UNUserNotificationCenter`** 表示这个 App 和系统的通知功能之间的入口，整个 App 只有一个。通过它可以问用户同不同意 App 发通知、把一条通知交给系统并约定什么时候送达、查看和撤销交出去的通知，以及得知两件事：App 开着的时候到了一条通知；用户点了一条通知。

**通知**是系统替 App 展示给用户的一条消息：屏幕顶上滑下来的横幅、锁屏上的一行、**通知中心**（从屏幕顶部往下拉出来的列表）里的一项，可以带声音，可以改 App 图标右上角的数字（**角标**）。通知由系统展示，所以 App 没在运行时也能送达。

由 App 自己交给系统的通知叫**本地通知**。由服务器经苹果的推送服务送到手机上的叫**远程推送**。这个包发的是本地通知；远程推送的通知到了、被点了，App 也从同样的两个事件得知。

它属于 `@nacrejs/user-notifications` 这个包。包里的其余类都是一条通知的组成部分：

| 类 | 表示什么 |
| --- | --- |
| [`UNMutableNotificationContent`](un-mutable-notification-content.md) | 自己写的一条通知的内容：标题、正文、声音、角标、数据 |
| [`UNNotificationContent`](un-notification-content.md) | 只读的内容：从请求和通知里读出来的 |
| [`UNNotificationSound`](un-notification-sound.md) | 通知到的时候播放的声音 |
| [`UNNotificationTrigger`](un-notification-trigger.md) | 三种触发方式共同的父类 |
| [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md) | 过多少秒之后送达 |
| [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md) | 到了某个日期和时间送达 |
| [`UNPushNotificationTrigger`](un-push-notification-trigger.md) | 这条通知是远程推送送来的 |
| [`UNNotificationRequest`](un-notification-request.md) | 一条要发的通知：标识、内容、触发方式 |
| [`UNNotification`](un-notification.md) | 一条已经送达的通知 |
| [`UNNotificationResponse`](un-notification-response.md) | 用户对一条通知做的动作 |
| [`UNNotificationSettings`](un-notification-settings.md) | 这个 App 的通知设置的一份快照 |

这一组里成员的形状、参数怎么转换、写错时的报错，来自代码和验收用例。系统的行为（提示框、通知什么时候到、横幅的样子、两个事件什么时候来）来自 Apple 的头文件和文档，**都还没有在模拟器上验证**，各成员页逐处标出。

**继承关系**：`EventTarget` → `NSObject` → `UNUserNotificationCenter`

怎么申请授权、发通知、处理点击，见指南[发本地通知](../guides/local-notifications.md)。

## 要先安装

通知不在核心里，要先装 `@nacrejs/user-notifications` 这个包才有。没装的时候全局上没有 `UNUserNotificationCenter` 这些类，读这些名字抛 `ReferenceError`，类型检查也报找不到名字。

这个包不需要在 `nacre.config.json` 里写权限文案：问用户同不同意时，提示框里的话是系统自己的。所以只有两步。

**1. 装包。**

```bash
npm install @nacrejs/user-notifications
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacreUserNotifications.framework`。不装的项目，产物里没有它。

**2. 让类型进来。** 在入口文件顶上加一行：

```
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/user-notifications" />
```

**效果**：编辑器里 `UNUserNotificationCenter` 等类有了补全和检查。少了这一行，`tsc` 报 `Cannot find name 'UNUserNotificationCenter'`。

## 构造函数

不能用 `new` 创建，也不能继承。`new UNUserNotificationCenter()` 抛 `TypeError`：

```
Illegal constructor: UNUserNotificationCenter is created by the runtime, not by new
```

从 [`UNUserNotificationCenter.currentNotificationCenter()`](un-user-notification-center/currentnotificationcenter.md) 取。

## 静态方法

[`UNUserNotificationCenter.currentNotificationCenter()`](un-user-notification-center/currentnotificationcenter.md)

这个 App 的通知中心。每次得到同一个对象。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`foregroundPresentationOptions`](un-user-notification-center/foregroundpresentationoptions.md) | App 在前台时到的通知怎么展示。默认不展示 |

## 实例方法

授权和设置：

| 方法 | 说明 |
| --- | --- |
| [`requestAuthorizationWithOptions()`](un-user-notification-center/requestauthorizationwithoptions.md) | 问用户同不同意这个 App 发通知 |
| [`getNotificationSettings()`](un-user-notification-center/getnotificationsettings.md) | 读现在的通知设置，不弹提示框 |

发通知、查和撤：

| 方法 | 说明 |
| --- | --- |
| [`addNotificationRequest()`](un-user-notification-center/addnotificationrequest.md) | 把一条通知交给系统 |
| [`getPendingNotificationRequests()`](un-user-notification-center/getpendingnotificationrequests.md) | 还没到的通知 |
| [`removePendingNotificationRequestsWithIdentifiers()`](un-user-notification-center/removependingnotificationrequestswithidentifiers.md) | 按标识撤销还没到的 |
| [`removeAllPendingNotificationRequests()`](un-user-notification-center/removeallpendingnotificationrequests.md) | 撤销全部还没到的 |
| [`getDeliveredNotifications()`](un-user-notification-center/getdeliverednotifications.md) | 已经送达、还留在通知中心里的通知 |
| [`removeDeliveredNotificationsWithIdentifiers()`](un-user-notification-center/removedeliverednotificationswithidentifiers.md) | 按标识从通知中心里拿掉 |
| [`removeAllDeliveredNotifications()`](un-user-notification-center/removealldeliverednotifications.md) | 从通知中心里拿掉全部 |
| [`setBadgeCount()`](un-user-notification-center/setbadgecount.md) | 改图标上的数字 |

返回 Promise 的方法，参数写错时**同步抛** `TypeError`，不返回被拒绝的 Promise。系统报告的失败才是拒绝，见[错误](#错误)。

## 事件

用 `addEventListener()` 监听。两个事件都不可取消，回调在事件发生之后的下一轮执行。

| 事件 | 什么时候派发 |
| --- | --- |
| [`notification`](un-user-notification-center/notification-event.md) | App 在前台时到了一条通知 |
| [`notificationclick`](un-user-notification-center/notificationclick-event.md) | 用户点了一条通知。App 是被这次点击启动的也收得到 |

监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

## 一条通知由三样东西组成

| | 是什么 | 用哪个类 |
| --- | --- | --- |
| **内容** | 标题、正文、声音、角标、跟着通知走的数据 | [`UNMutableNotificationContent`](un-mutable-notification-content.md) |
| **触发方式** | 什么时候送达：过多少秒，或者到了某个日期和时间。不给就是立刻 | [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md)、[`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md) |
| **请求** | 把内容和触发方式合在一起，再起一个**标识** | [`UNNotificationRequest`](un-notification-request.md) |

把请求交给 [`addNotificationRequest()`](un-user-notification-center/addnotificationrequest.md)，这条通知就由系统保管。之后它经过三个阶段：

| 阶段 | 怎么查 | 怎么撤 |
| --- | --- | --- |
| **还没到**：交给了系统，触发的时刻还没到 | `getPendingNotificationRequests()` | `removePendingNotificationRequestsWithIdentifiers()` |
| **已经送达**：展示过了，还留在通知中心里 | `getDeliveredNotifications()` | `removeDeliveredNotificationsWithIdentifiers()` |
| **用户做了动作**：点了它，App 被打开 | `notificationclick` 事件 | — |

标识是这条通知的名字，由 App 自己起。撤销时按它找；再交一条标识相同的请求，系统用新的替换旧的，不会出现两条。

## 请求、内容、触发器是值

[`UNNotificationRequest`](un-notification-request.md)、[`UNNotificationContent`](un-notification-content.md)、三种触发器、[`UNNotification`](un-notification.md)、[`UNNotificationResponse`](un-notification-response.md)、[`UNNotificationSettings`](un-notification-settings.md) 都是只读的值：字段不能改，也不能加字段，写了抛 `TypeError`。唯一能改字段的是 [`UNMutableNotificationContent`](un-mutable-notification-content.md)，它用来写内容。

- **建请求时，内容被复制一份。** `requestWithIdentifier()` 之后再改原来的内容，已经建好的请求不变。同一个内容对象可以改一改、再建下一个请求。
- **从系统读回来的是新的对象。** `getPendingNotificationRequests()` 给的请求和当初交出去的那个不是同一个对象，内容相同。比较两个请求用 `identifier`，不要用 `===`。
- **设置是一份快照。** 用户之后在系统设置里改了，手里的 `UNNotificationSettings` 不会变，要再取一次。

这些值是普通的 JS 对象，不继承 `NSObject`，只能由这个包建出来：除了 `UNMutableNotificationContent`，它们都不能用 `new` 创建。

## 错误

返回 Promise 的方法被拒绝时，给的是一个 `Error`（类型定义里叫 `UNError`），多三个字段：

| 字段 | 含义 |
| --- | --- |
| `name` | 分类，见下表 |
| `code` | 系统的错误码（整数） |
| `domain` | 系统的错误域，通知的错误是 `'UNErrorDomain'` |

| `name` | 含义 |
| --- | --- |
| `'NotAllowedError'` | 用户没有允许这个 App 发通知（`code` 是 1） |
| `'UNError'` | 系统报告的其他错误，看 `code`。Apple 的头文件里列出的有 1400（触发器算不出下一次的时刻）、1401（通知没有内容）、1600（角标的数无效） |

哪种情况下系统报哪个错误码，**未在模拟器验证**。

## 示例

### 5 秒后提醒

从空白 App 开始，屏幕中间放一行字和一个按钮。点按钮时申请授权，然后约定 5 秒后送达一条通知。通知到了和被点了，那行字跟着变。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/user-notifications" />

const center = UNUserNotificationCenter.currentNotificationCenter();

application.addEventListener('sceneconnect', (e) => {
  // App 开着时也显示横幅、播放声音、留在通知中心里。不设的话只有事件
  center.foregroundPresentationOptions = ['banner', 'list', 'sound'];

  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.text = '还没有通知';
  label.numberOfLines = 0;
  label.textAlignment = 'center';
  const button = UIButton.buttonWithType('system');
  button.setTitle('5 秒后提醒我', { forState: ['normal'] });
  for (const view of [label, button]) {
    view.translatesAutoresizingMaskIntoConstraints = false;
    page.view.addSubview(view);
  }
  NSLayoutConstraint.activateConstraints([
    label.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    button.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    button.topAnchor.constraintEqualToAnchor(label.bottomAnchor, { constant: 16 }),
  ]);

  center.addEventListener('notification', (event) => {
    label.text = '到了：' + event.notification.request.content.title;
  });
  center.addEventListener('notificationclick', (event) => {
    const info = event.response.notification.request.content.userInfo;
    label.text = '点了：' + String(info.what);
  });

  button.addEventListener('click', async () => {
    const granted = await center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
    if (!granted) {
      label.text = '用户没有允许通知';
      return;
    }

    const content = new UNMutableNotificationContent();
    content.title = '该喝水了';
    content.body = '离上一杯已经 5 秒';
    content.sound = UNNotificationSound.defaultSound;
    content.userInfo = { what: 'water' };

    const request = UNNotificationRequest.requestWithIdentifier('water-reminder', {
      content,
      trigger: UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5),
    });
    try {
      await center.addNotificationRequest(request);
      label.text = '已经交给系统，5 秒后到';
    } catch (err) {
      label.text = '没发出去：' + (err instanceof Error ? err.name : String(err));
    }
  });
});
```

**效果**（**未在模拟器验证**）

- 屏幕中间显示「还没有通知」，下面是蓝色的「5 秒后提醒我」。
- 第一次点按钮，系统弹出提示框，问是否允许这个 App 发通知。
- 用户允许之后，文字变成「已经交给系统，5 秒后到」。
- 5 秒后，屏幕顶上滑下一条横幅，标题「该喝水了」，正文「离上一杯已经 5 秒」，播放声音。文字变成「到了：该喝水了」。
- 点那条横幅，文字变成「点了：water」。
- 点按钮之后在 5 秒内回到桌面：通知照样到，这时 App 不在前台，没有 `notification`。点那条通知，App 回到前台，文字变成「点了：water」。
- 用户不允许，文字变成「用户没有允许通知」。之后再点按钮不再弹提示框。

更多写法（每天固定时间、撤销、角标、远程推送）见指南[发本地通知](../guides/local-notifications.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UNUserNotificationCenter currentNotificationCenter]` | `UNUserNotificationCenter.currentNotificationCenter()` |
| `[center requestAuthorizationWithOptions:UNAuthorizationOptionAlert \| UNAuthorizationOptionSound completionHandler:^(BOOL granted, NSError *error) { … }]` | `center.requestAuthorizationWithOptions(['alert', 'sound'])`，返回 `Promise<boolean>` |
| `[center getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings *settings) { … }]` | `center.getNotificationSettings()`，返回 Promise |
| `[center addNotificationRequest:request withCompletionHandler:^(NSError *error) { … }]` | `center.addNotificationRequest(request)`，返回 Promise |
| `[center getPendingNotificationRequestsWithCompletionHandler:…]` | `center.getPendingNotificationRequests()`，返回 Promise |
| `[center removePendingNotificationRequestsWithIdentifiers:@[@"water"]]` | `center.removePendingNotificationRequestsWithIdentifiers(['water'])` |
| `[center removeAllPendingNotificationRequests]` | `center.removeAllPendingNotificationRequests()` |
| `[center getDeliveredNotificationsWithCompletionHandler:…]` | `center.getDeliveredNotifications()`，返回 Promise |
| `[center removeDeliveredNotificationsWithIdentifiers:@[@"water"]]` | `center.removeDeliveredNotificationsWithIdentifiers(['water'])` |
| `[center removeAllDeliveredNotifications]` | `center.removeAllDeliveredNotifications()` |
| `[center setBadgeCount:3 withCompletionHandler:…]` | `center.setBadgeCount(3)`，返回 Promise |
| `center.delegate = self` | 不需要，用 `addEventListener` |
| `userNotificationCenter:willPresentNotification:withCompletionHandler:` | `notification` 事件，`event.notification` |
| 在上面那个方法里调 `completionHandler(UNNotificationPresentationOptionBanner \| UNNotificationPresentationOptionSound)` | 预先设 `center.foregroundPresentationOptions = ['banner', 'sound']` |
| `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:` | `notificationclick` 事件，`event.response` |
| `error.code == UNErrorCodeNotificationsNotAllowed` | `error.name === 'NotAllowedError'` |

## 参见

- [发本地通知](../guides/local-notifications.md)：申请授权、各种触发方式、处理点击、撤销、角标
- [核心和能力包](capabilities.md)：哪些能力要单独装
- [`Application`](application.md)：`active` 事件，App 回到前台时重新读通知设置
- [枚举](enums.md)：授权状态和选项为什么是字符串和字符串数组，写错了会怎样
- [运行时怎么工作](how-it-works.md)：事件的回调为什么在下一轮执行
