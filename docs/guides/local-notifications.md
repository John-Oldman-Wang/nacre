# 发本地通知

这一篇讲怎么让 App 发通知：问用户同不同意、约定什么时候送达、App 开着时也显示横幅、用户点了通知之后打开对应的页面、撤销和清理。入口是 [`UNUserNotificationCenter`](../api/un-user-notification-center.md)，一条通知由[内容](../api/un-mutable-notification-content.md)、[触发方式](../api/un-notification-trigger.md)和[请求](../api/un-notification-request.md)组成，它们都在 `@nacrejs/user-notifications` 这个包里。先照 [`UNUserNotificationCenter`](../api/un-user-notification-center.md#要先安装) 的「要先安装」装好包。

这一篇里系统的行为（提示框、通知什么时候到、横幅的样子、两个事件什么时候来）都**未在模拟器验证**。

## 推荐的做法

- **在用户做了一件明显需要通知的事时再申请授权**（设了一个提醒、下了一个订单），不要一启动就弹：用户还不知道这个 App 会发什么，多半会拒绝，而拒绝之后不能再问。
- **每次发通知之前都可以调一次 `requestAuthorizationWithOptions()`。** 提示框只出现一次，问过之后它直接兑现成现在的结果。
- **在 `sceneconnect` 的回调里设 `foregroundPresentationOptions`。** 它的默认值是 `[]`，App 开着时到的通知不显示；它只存在内存里，每次启动都要设。
- **改一条还没到的通知，直接交一条标识相同的新请求。** 系统用新的替换旧的，不用先撤销。
- **用 `userInfo` 带数据，在 `notificationclick` 里按它打开页面。** App 是被点击启动的也收得到这次点击。

## 第一个例子

从空白 App 开始，屏幕中间放一行字和一个按钮。点按钮时申请授权，然后约定 5 秒后送达一条通知。通知到了和被点了，那行字跟着变。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/user-notifications" />

const center = UNUserNotificationCenter.currentNotificationCenter();

application.addEventListener('sceneconnect', (e) => {
  // App 开着时也显示横幅、播放声音、留在通知中心里。不设的话只有事件
  center.foregroundPresentationOptions = ['banner', 'list', 'sound'];

  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一行字和一个按钮
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

  // 2. 两个事件
  center.addEventListener('notification', (event) => {
    label.text = '到了：' + event.notification.request.content.title;
  });
  center.addEventListener('notificationclick', (event) => {
    const info = event.response.notification.request.content.userInfo;
    label.text = '点了：' + String(info.what);
  });

  button.addEventListener('click', async () => {
    // 3. 申请授权。问过了就当场得到现在的结果，不会重复弹
    const granted = await center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
    if (!granted) {
      label.text = '用户没有允许通知';
      return;
    }

    // 4. 内容
    const content = new UNMutableNotificationContent();
    content.title = '该喝水了';
    content.body = '离上一杯已经 5 秒';
    content.sound = UNNotificationSound.defaultSound;
    content.userInfo = { what: 'water' };

    // 5. 5 秒后送达。标识相同，所以连点几次只会有一条
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

下面的例子沿用这里的 `center`。`content` 是一个已经写好标题的 `UNMutableNotificationContent`。用到 `await` 的片段写在 `async` 函数里。单独试某一节时，在第一个例子最上面那几行（引入类型、取 `center`）之后写：

```js
const content = new UNMutableNotificationContent();
content.title = '新订单';
```

## 用户同不同意

App 要先得到用户的同意才能发通知。[`requestAuthorizationWithOptions(['alert', 'sound', 'badge'])`](../api/un-user-notification-center/requestauthorizationwithoptions.md) 向用户申请，返回 Promise，兑现成 `true`（同意）或 `false`（拒绝）。

- **提示框只出现一次。** 第一次调用时系统弹出提示框。之后再调不会再弹，直接兑现成现在的结果。
- **用户拒绝之后，App 没有办法再弹提示框。** 只有用户自己去系统的「设置」里改。
- **不申请也能读状态。** [`getNotificationSettings()`](../api/un-user-notification-center/getnotificationsettings.md) 不弹任何东西，兑现成一份设置，其中 `authorizationStatus` 是 `'notDetermined'`（还没问过）、`'denied'`、`'authorized'` 等。

没有得到同意时调 `addNotificationRequest()`，Promise 被拒绝，`name` 是 `'NotAllowedError'`。

## 申请之前先看状态

```js
async function ensureAuthorized() {
  const settings = await center.getNotificationSettings();
  if (settings.authorizationStatus === 'authorized') return true;
  if (settings.authorizationStatus === 'denied') return false;
  return center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
}
```

**效果**：已经同意时兑现 `true`，已经拒绝时兑现 `false`，两种都不弹提示框。还没问过时弹提示框，兑现成用户的选择。已经拒绝时，App 可以在自己的界面上说明去哪里打开。

用户改了设置时没有事件：改设置要离开 App 去系统的「设置」，回来时在 `application` 的 [`active` 事件](../api/application.md)里重新取一次。

## App 开着的时候也显示

App 在前台时到了一条通知，怎么展示由 [`foregroundPresentationOptions`](../api/un-user-notification-center/foregroundpresentationoptions.md) 决定。它的默认值是 `[]`：**不展示**，没有横幅，没有声音，通知中心里也没有。这时 `center` 派发 [`notification`](../api/un-user-notification-center/notification-event.md) 事件，App 可以在自己的界面上处理。

要让系统照常展示，把要的几样写进去：

```js
application.addEventListener('sceneconnect', () => {
  center.foregroundPresentationOptions = ['banner', 'list', 'sound'];
});
```

**效果**：之后 App 开着时到的通知，顶上滑下横幅，播放声音，并且留在通知中心里。事件照常派发。

这个属性是预先设好的：通知到的那一刻系统按它的值处理，不等 JS 的事件监听器。所以不能在 `notification` 的监听器里决定这一条显不显示，见[按当前界面决定显不显示](#按当前界面决定显不显示)。

> **注意**：这一行要写在函数里面。写在 JS 文件的最外层时，类型检查（TypeScript 5.9.3）把右边的数组当成普通的字符串数组，报 `Type 'string[]' is not assignable to type 'UNNotificationPresentationOptions[]'`。运行不受影响。

## 立刻发一条

```js
async function notifyNow() {
  const content = new UNMutableNotificationContent();
  content.title = '下载完成';
  content.body = '报表.pdf';
  await center.addNotificationRequest(
    UNNotificationRequest.requestWithIdentifier('download-done', { content }));
}
```

**效果**：不带 `trigger`，通知立刻送达。App 在前台时显不显示看 `foregroundPresentationOptions`。

## 每隔一段时间重复

```js
const hourly = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true });
```

**效果**：一小时后送达，之后每小时一次，直到这条请求被撤销。重复的间隔至少 60 秒，短于 60 秒时这一行抛 `TypeError`。

## 每天固定的时间

```js
const everyMorning = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
  { hour: 8, minute: 30 }, { repeats: true });
```

**效果**：每天 8 点 30 分送达，按用户手机上的时区。只写要匹配的分量：`{ hour: 8, minute: 30 }` 匹配每一天的 8:30；加上 `weekday: 2` 就只匹配星期一（1 是星期日）。

去掉 `repeats`，只在最近的一次 8:30 送达一次。全部分量见 [`triggerWithDateMatchingComponents()`](../api/un-calendar-notification-trigger/triggerwithdatematchingcomponents.md)。

## 在某一个时刻

```js
/** @param {Date} when */
function triggerAt(when) {
  return UNCalendarNotificationTrigger.triggerWithDateMatchingComponents({
    year: when.getFullYear(),
    month: when.getMonth() + 1,
    day: when.getDate(),
    hour: when.getHours(),
    minute: when.getMinutes(),
    second: when.getSeconds(),
  });
}
const tomorrow = triggerAt(new Date(Date.now() + 24 * 3600 * 1000));
```

**效果**：到了 `when` 那一刻送达一次。`Date` 的月份从 0 开始，日期分量的月份从 1 开始，所以要加 1。

也可以用秒数：`triggerWithTimeInterval((when.getTime() - Date.now()) / 1000)`。两种写法的区别在用户改了手机的时间或时区之后：按秒的仍然是「从现在起这么久」，按日期分量的跟着新的时钟走。

## 带上数据，点了之后拿回来

```js
content.userInfo = { screen: 'order', orderId: 'A1024' };

center.addEventListener('notificationclick', (event) => {
  const info = event.response.notification.request.content.userInfo;
  if (info.screen === 'order') {
    console.log('打开订单', info.orderId);
  }
});
```

**效果**：用户点这条通知，输出「打开订单 A1024」。

`userInfo` 的值只能是字符串、有限的数、布尔、数组和普通对象。里面有 `null`、`Date`、函数时，赋值的那一行抛 `TypeError`，报错里写明是哪一个，比如 `userInfo.a.b must be a string, number, boolean, array or plain object, got null`。

## 点了通知把 App 启动起来

用户点一条通知时 App 可能没在运行。系统启动 App，然后交出这次点击。这时 JS 可能还没执行到 `addEventListener` 那一行，但点击不会丢：运行时把没有人监听时到的点击留着，等 `notificationclick` 第一次有监听器时补发。最多留 8 条，规则见 [`notificationclick`](../api/un-user-notification-center/notificationclick-event.md#什么时候派发)。

所以监听器加在哪里都可以，比如等首页建好之后再加：

```js
application.addEventListener('sceneconnect', () => {
  // ……先建好窗口和首页
  center.addEventListener('notificationclick', (event) => {
    console.log('从通知打开', event.response.notification.request.identifier);
  });
});
```

**效果**：用户点通知启动了 App，首页建好之后输出这一行。

`notification` 不留：没有监听器时到的，不补发。

## 按当前界面决定显不显示

```js
// 进了聊天页：这段时间到的通知不弹，由页面自己显示新消息
function onChatOpened() {
  center.foregroundPresentationOptions = [];
}
// 离开聊天页：照常弹
function onChatClosed() {
  center.foregroundPresentationOptions = ['banner', 'list', 'sound'];
}
center.addEventListener('notification', (event) => {
  console.log('新消息', event.notification.request.content.body);
});
```

**效果**：聊天页开着时到的通知不出现横幅，只输出一行「新消息 …」。离开之后到的通知照常出现横幅，同样输出一行。

这个属性对所有通知生效，不能只对某一条或某一类生效。

## 撤销一条还没到的

```js
center.removePendingNotificationRequestsWithIdentifiers(['water-reminder']);
```

**效果**：标识是 `water-reminder` 的那条不再送达。没有这个标识也不报错。

要改一条还没到的通知，不用先撤销：再交一条标识相同的请求，系统用新的替换旧的。

## 清掉通知中心里的和图标上的数字

```js
async function clearAll() {
  center.removeAllDeliveredNotifications();
  await center.setBadgeCount(0);
}
```

**效果**：通知中心里这个 App 的通知全部消失，图标右上角的数字去掉。常见的做法是在用户看过消息之后做这两件事。

## 列出还没到的

```js
async function listPending() {
  const requests = await center.getPendingNotificationRequests();
  for (const request of requests) {
    const trigger = request.trigger;
    if (trigger instanceof UNTimeIntervalNotificationTrigger) {
      console.log(request.identifier, trigger.timeInterval + ' 秒', trigger.repeats);
    } else if (trigger instanceof UNCalendarNotificationTrigger) {
      console.log(request.identifier, JSON.stringify(trigger.dateComponents), trigger.repeats);
    }
  }
}
```

**效果**：每条还没到的通知输出一行：标识、触发方式、是否重复。用 `instanceof` 分辨是哪一种触发方式。

## 收到远程推送的通知

```js
center.addEventListener('notificationclick', (event) => {
  const request = event.response.notification.request;
  if (request.trigger instanceof UNPushNotificationTrigger) {
    console.log('推送的负载', JSON.stringify(request.content.userInfo));
  }
});
```

**效果**：用户点了一条远程推送的通知时输出它的负载，也就是服务器发出的那个 JSON 对象。远程推送的通知和本地通知走同样的两个事件，区别是 `trigger` 是 [`UNPushNotificationTrigger`](../api/un-push-notification-trigger.md)。

让 App 能收到远程推送（向苹果注册、把设备令牌交给服务器）这个包还不能做。

## 参见

- [`UNUserNotificationCenter`](../api/un-user-notification-center.md)：通知的入口，以及怎么安装这个包
- [`UNMutableNotificationContent`](../api/un-mutable-notification-content.md)：内容的各个字段
- [`UNTimeIntervalNotificationTrigger`](../api/un-time-interval-notification-trigger.md)、[`UNCalendarNotificationTrigger`](../api/un-calendar-notification-trigger.md)：两种触发方式
- [`UNNotificationRequest`](../api/un-notification-request.md)：请求和标识
- [`UNNotificationSettings`](../api/un-notification-settings.md)：通知设置
