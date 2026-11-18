---
type: reference
native: UNUserNotificationCenter
status: partial
---

# 通知：`UNUserNotificationCenter`

**通知**是系统替 App 展示给用户的一条消息：屏幕顶上滑下来的横幅、锁屏上的一行、**通知中心**（从屏幕顶部往下拉出来的列表）里的一项，可以带声音，可以改 App 图标右上角的数字（**角标**）。通知由系统展示，所以 App 没在运行时也能送达。

**`UNUserNotificationCenter`** 表示这个 App 和系统的通知功能之间的入口，整个 App 只有一个。通过它可以问用户同不同意 App 发通知、把一条通知交给系统并约定什么时候送达、查看和撤销交出去的通知，以及得知两件事：App 开着的时候到了一条通知；用户点了一条通知。

由 App 自己交给系统的通知叫**本地通知**。由服务器经苹果的推送服务送到手机上的叫**远程推送**。这一页能发的只有本地通知；远程推送的通知到了、被点了，App 从同样的两个事件得知，但向苹果注册推送、拿到设备令牌还不能做，见[还不能做的](#还不能做的)。

> **注意**：通知不在核心里，要先装 `@nacrejs/user-notifications` 这个包才有。没装的时候全局上没有 `UNUserNotificationCenter`，类型检查也会报找不到这个名字。怎么装见下面「[先装上](#先装上)」。

> **注意**：这一页里成员的形状、参数怎么转换、写错时的报错，来自代码和验收用例。系统的行为（提示框、通知什么时候到、横幅的样子、两个事件什么时候来）来自 Apple 的头文件和文档，**都还没有在模拟器上验证**，下面逐处标了出来。

## 先装上

两步。这个包不需要在 `nacre.config.json` 里写权限文案：问用户同不同意时，提示框里的话是系统自己的。

**1. 装包。**

```bash
npm install @nacrejs/user-notifications
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacreUserNotifications.framework`。不装的项目，产物里没有它。

**2. 让类型进来。** 在入口文件顶上加一行：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/user-notifications" />
```

**效果**：编辑器里 `UNUserNotificationCenter` 有了补全和检查。少了这一行，`tsc` 报 `Cannot find name 'UNUserNotificationCenter'`。

## 一条通知由三样东西组成

| | 是什么 | 用哪个类 |
| --- | --- | --- |
| **内容** | 标题、正文、声音、角标、跟着通知走的数据 | `UNMutableNotificationContent` |
| **触发方式** | 什么时候送达：过多少秒，或者到了某个日期和时间。不给就是立刻 | `UNTimeIntervalNotificationTrigger`、`UNCalendarNotificationTrigger` |
| **请求** | 把内容和触发方式合在一起，再起一个**标识** | `UNNotificationRequest` |

把请求交给 `center.addNotificationRequest()`，这条通知就由系统保管。之后它经过三个阶段：

| 阶段 | 怎么查 | 怎么撤 |
| --- | --- | --- |
| **还没到**：交给了系统，触发的时刻还没到 | `getPendingNotificationRequests()` | `removePendingNotificationRequestsWithIdentifiers()` |
| **已经送达**：展示过了，还留在通知中心里 | `getDeliveredNotifications()` | `removeDeliveredNotificationsWithIdentifiers()` |
| **用户做了动作**：点了它，App 被打开 | `notificationclick` 事件 | — |

标识是这条通知的名字，由 App 自己起。撤销时按它找；再交一条标识相同的请求，系统用新的替换旧的，不会出现两条。

## 用户同不同意

App 要先得到用户的同意才能发通知。`center.requestAuthorizationWithOptions(['alert', 'sound', 'badge'])` 向用户申请，返回 Promise，兑现成 `true`（同意）或 `false`（拒绝）。

- **提示框只出现一次。** 第一次调用时系统弹出提示框。之后再调不会再弹，直接兑现成现在的结果。所以每次要发通知之前都调一次是安全的。**未在模拟器验证。**
- **用户拒绝之后，App 没有办法再弹提示框。** 只有用户自己去系统的「设置」里改。
- **不申请也能读状态。** `center.getNotificationSettings()` 不弹任何东西，兑现成一份设置，其中 `authorizationStatus` 是 `'notDetermined'`（还没问过）、`'denied'`、`'authorized'` 等。
- **什么时候申请由 App 决定。** 推荐在用户做了一件明显需要通知的事时再申请（设了一个提醒、下了一个订单），不要一启动就弹：用户还不知道这个 App 会发什么，多半会拒绝，而拒绝之后不能再问。

没有得到同意时调 `addNotificationRequest()`，Promise 被拒绝，`name` 是 `'NotAllowedError'`。**未在模拟器验证。**

## App 开着的时候，通知默认不显示

App 在前台（用户正在用它）时到了一条通知，怎么展示由 `center.foregroundPresentationOptions` 决定。它的默认值是 `[]`：**不展示**，没有横幅，没有声音，通知中心里也没有。用户正看着 App，App 可以在自己的界面上处理：这时 `center` 派发 `notification` 事件，事件里带着这条通知。

要让系统照常展示，把要的几样写进去：

```js
application.addEventListener('sceneconnect', () => {
  const center = UNUserNotificationCenter.currentNotificationCenter();
  center.foregroundPresentationOptions = ['banner', 'list', 'sound'];
});
```

**效果**（未在模拟器验证）：之后 App 开着时到的通知，顶上滑下横幅，播放声音，并且留在通知中心里。事件照常派发。

这个属性是**预先设好**的：通知到的那一刻系统按它的值处理，不等 JS 的事件监听器。所以不能在 `notification` 的监听器里决定这一条显不显示，那时已经定了。要按当时的界面决定（聊天页开着就不弹这个会话的通知），在界面变化的时候改这个属性，见[按当前界面决定显不显示](#按当前界面决定显不显示)。

属性的值只存在内存里，App 每次启动都是 `[]`，所以每次启动都要设。推荐像上面那样在 `sceneconnect` 的回调里设：界面出现之前它一定执行过。

> **注意**：这一行要写在函数里面。写在 JS 文件的最外层时，类型检查（TypeScript 5.9.3）把右边的数组当成普通的字符串数组，报 `Type 'string[]' is not assignable to type 'UNNotificationPresentationOptions[]'`。运行不受影响。

## 用户点了通知

用户点一条通知，系统把 App 带到前台（没在运行就启动它），然后 `center` 派发 `notificationclick` 事件。事件的 `response.notification` 是被点的那一条，`response.notification.request.content.userInfo` 是当初放进内容里的数据，用它决定打开哪个页面。

**监听器什么时候加都收得到启动时的那一次点击。** 用户点通知把 App 启动起来时，系统交出这次点击的时刻，JS 可能还没执行到 `addEventListener` 那一行。运行时把没有人监听时到的点击留着，等这个事件第一次有监听器时补发。规则：

- 最多留 8 条，超出时丢掉最早的。
- 没有时间限制，留到有监听器为止。
- 补发之后就清掉。监听器全部移除之后到的点击同样留着，下一次有监听器时补发。

`notification` 不留：没有监听器时到的，不补发。

## 请求、内容、触发器是值

`UNNotificationRequest`、`UNNotificationContent`、三种触发器、`UNNotification`、`UNNotificationResponse`、`UNNotificationSettings` 都是只读的值：字段不能改，也不能加字段，写了抛 `TypeError`。唯一能改的是 `UNMutableNotificationContent`，它用来写内容。

- **建请求时，内容被复制一份。** `requestWithIdentifier()` 之后再改原来的内容，已经建好的请求不变。同一个内容对象可以改一改、再建下一个请求。
- **从系统读回来的是新的对象。** `getPendingNotificationRequests()` 给的请求和当初交出去的那个不是同一个对象，内容相同。比较两个请求用 `identifier`，不要用 `===`。
- **设置是一份快照。** 用户之后在系统设置里改了，手里的 `UNNotificationSettings` 不会变，要再取一次。

## 完整例子

下面的代码从空白 App 开始，屏幕中间放一行字和一个按钮。点按钮时申请授权，然后约定 5 秒后送达一条通知。通知到了和被点了，那行字跟着变。

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

**效果**（未在模拟器验证）

- 屏幕中间显示「还没有通知」，下面是蓝色的「5 秒后提醒我」。
- 第一次点按钮，系统弹出提示框，问是否允许这个 App 发通知。
- 用户允许之后，文字变成「已经交给系统，5 秒后到」。
- 5 秒后，屏幕顶上滑下一条横幅，标题「该喝水了」，正文「离上一杯已经 5 秒」，播放声音。文字变成「到了：该喝水了」。
- 点那条横幅，文字变成「点了：water」。
- 点按钮之后在 5 秒内回到桌面：通知照样到，这时 App 不在前台，没有 `notification`。点那条通知，App 回到前台，文字变成「点了：water」。
- 用户不允许，文字变成「用户没有允许通知」。之后再点按钮不再弹提示框。

## 常见用法

这一节的例子沿用上面的 `center`。`content` 是一个已经写好标题的 `UNMutableNotificationContent`。用到 `await` 的片段写在 `async` 函数里。

### 申请之前先看状态

```js
async function ensureAuthorized() {
  const settings = await center.getNotificationSettings();
  if (settings.authorizationStatus === 'authorized') return true;
  if (settings.authorizationStatus === 'denied') return false;
  return center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
}
```

**效果**：已经同意时兑现 `true`，已经拒绝时兑现 `false`，两种都不弹提示框。还没问过时弹提示框，兑现成用户的选择（未在模拟器验证）。已经拒绝时，App 可以在自己的界面上说明去哪里打开。

### 立刻发一条

```js
async function notifyNow() {
  const content = new UNMutableNotificationContent();
  content.title = '下载完成';
  content.body = '报表.pdf';
  await center.addNotificationRequest(
    UNNotificationRequest.requestWithIdentifier('download-done', { content }));
}
```

**效果**（未在模拟器验证）：不带 `trigger`，通知立刻送达。App 在前台时显不显示看 `foregroundPresentationOptions`。

### 每隔一段时间重复

```js
const hourly = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true });
```

**效果**：一小时后送达，之后每小时一次，直到这条请求被撤销（未在模拟器验证）。重复的间隔至少 60 秒，短于 60 秒时这一行抛 `TypeError`。

### 每天固定的时间

```js
const everyMorning = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
  { hour: 8, minute: 30 }, { repeats: true });
```

**效果**（未在模拟器验证）：每天 8 点 30 分送达，按用户手机上的时区。只写要匹配的分量：`{ hour: 8, minute: 30 }` 匹配每一天的 8:30；加上 `weekday: 2` 就只匹配星期一（1 是星期日）。

去掉 `repeats`，只在最近的一次 8:30 送达一次。

### 在某一个时刻

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

**效果**（未在模拟器验证）：到了 `when` 那一刻送达一次。`Date` 的月份从 0 开始，日期分量的月份从 1 开始，所以要加 1。

也可以用秒数：`triggerWithTimeInterval((when.getTime() - Date.now()) / 1000)`。两种写法的区别在用户改了手机的时间或时区之后：按秒的仍然是「从现在起这么久」，按日期分量的跟着新的时钟走。

### 带上数据，点了之后拿回来

```js
content.userInfo = { screen: 'order', orderId: 'A1024' };

center.addEventListener('notificationclick', (event) => {
  const info = event.response.notification.request.content.userInfo;
  if (info.screen === 'order') {
    console.log('打开订单', info.orderId);
  }
});
```

**效果**（未在模拟器验证）：用户点这条通知，输出「打开订单 A1024」。App 是被这次点击启动的也一样，见[用户点了通知](#用户点了通知)。

`userInfo` 的值只能是字符串、有限的数、布尔、数组和普通对象。里面有 `null`、`Date`、函数时，赋值的那一行抛 `TypeError`，报错里写明是哪一个，比如 `userInfo.a.b must be a string, number, boolean, array or plain object, got null`。

### 按当前界面决定显不显示

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

**效果**（未在模拟器验证）：聊天页开着时到的通知不出现横幅，只输出一行「新消息 …」。离开之后到的通知照常出现横幅，同样输出一行。

这个属性对所有通知生效，不能只对某一条或某一类生效。

### 撤销一条还没到的

```js
center.removePendingNotificationRequestsWithIdentifiers(['water-reminder']);
```

**效果**（未在模拟器验证）：标识是 `water-reminder` 的那条不再送达。没有这个标识也不报错。

要改一条还没到的通知，不用先撤销：再交一条标识相同的请求，系统用新的替换旧的。

### 清掉通知中心里的和图标上的数字

```js
async function clearAll() {
  center.removeAllDeliveredNotifications();
  await center.setBadgeCount(0);
}
```

**效果**（未在模拟器验证）：通知中心里这个 App 的通知全部消失，图标右上角的数字去掉。常见的做法是在用户看过消息之后做这两件事。

### 列出还没到的

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

**效果**（未在模拟器验证）：每条还没到的通知输出一行：标识、触发方式、是否重复。用 `instanceof` 分辨是哪一种触发方式。

### 收到远程推送的通知

```js
center.addEventListener('notificationclick', (event) => {
  const request = event.response.notification.request;
  if (request.trigger instanceof UNPushNotificationTrigger) {
    console.log('推送的负载', JSON.stringify(request.content.userInfo));
  }
});
```

**效果**（未在模拟器验证）：用户点了一条远程推送的通知时输出它的负载，也就是服务器发出的那个 JSON 对象。远程推送的通知和本地通知走同样的两个事件，区别是 `trigger` 是 `UNPushNotificationTrigger`。

让 App 能收到远程推送（向苹果注册、把设备令牌交给服务器）这个包还不能做。

## 成员说明

### `UNUserNotificationCenter`

不能 `new`，不能继承。从 `UNUserNotificationCenter.currentNotificationCenter()` 取，每次得到同一个对象。运行时一直保留着它，挂在它上面的监听器不会丢，不用自己存。

**属性**

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `foregroundPresentationOptions` | 名字的数组 | 是 | 是 | `[]` | App 在前台时到的通知怎么展示。只有 App 自己能改，没有变化通知 |

`foregroundPresentationOptions` 的取值，可以同时写几个：

| 名字 | 效果 |
| --- | --- |
| `'banner'` | 屏幕顶上滑下一条横幅 |
| `'list'` | 留在通知中心里 |
| `'sound'` | 播放内容里的 `sound`。内容的 `sound` 是 `null` 时没有声音 |
| `'badge'` | 把图标上的数字改成内容里的 `badge`。内容的 `badge` 是 `null` 时不改 |

读出来是一个新的数组，按 `badge`、`sound`、`list`、`banner` 的先后排，和写进去的先后无关；重复写的名字只算一次。修改读出来的数组不影响设置。

数组里有不认识的名字时（比如 `['banner', 'popup']`）不抛异常：整次赋值不生效，原来的值不变，控制台输出一条警告 `[Nacre] foregroundPresentationOptions has no value "popup"; expected one of: badge / sound / list / banner, ignored`。数组里写对的名字不会被单独应用。

给的不是数组时抛 `TypeError`，原来的值不变：

| 写法 | 报错信息 |
| --- | --- |
| 不是数组，`'banner'` | `foregroundPresentationOptions must be an array of names, got "banner"` |
| `null`、`undefined` | `foregroundPresentationOptions must be an array of names, got null` |

**方法**

返回 Promise 的方法，参数写错时**同步抛** `TypeError`，不返回被拒绝的 Promise。系统报告的失败才是拒绝，见[错误](#错误)。

#### `requestAuthorizationWithOptions(options)`

问用户同不同意这个 App 发通知。返回 `Promise<boolean>`：`true` 是同意。

```js
center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']).then((granted) => {
  console.log(granted);
});
```

**效果**（未在模拟器验证）：还没问过时系统弹出提示框，用户选完之后输出 `true` 或 `false`。已经问过时当场输出现在的结果。

`options` 是名字的数组，必填，可以是空数组：

| 名字 | 申请什么 |
| --- | --- |
| `'alert'` | 展示通知：横幅、锁屏、通知中心 |
| `'sound'` | 播放声音 |
| `'badge'` | 改图标上的数字 |
| `'carPlay'` | 在 CarPlay（车载屏幕）上展示 |
| `'provisional'` | 临时授权：不弹提示框，直接兑现 `true`，但通知只安静地进通知中心，没有横幅和声音，用户在那里选择保留还是关掉。未在模拟器验证 |
| `'criticalAlert'` | 紧急通知：无视静音和勿扰模式。需要苹果单独批准的权限，没有时这一项不生效。未在模拟器验证 |
| `'providesAppNotificationSettings'` | 告诉系统这个 App 有自己的通知设置页，系统会在它的通知设置里加一个按钮。按钮被点的通知这个包还没有接 |

| 写法 | 报错信息 |
| --- | --- |
| 不带参数 | `requestAuthorizationWithOptions: options must be an array of names, got undefined` |
| 不认识的名字，`['alert', 'popup']` | `requestAuthorizationWithOptions has no value "popup"; expected one of: badge / sound / alert / carPlay / criticalAlert / providesAppNotificationSettings / provisional` |

#### `getNotificationSettings()`

读现在的通知设置。没有参数，不弹提示框。返回 `Promise<UNNotificationSettings>`，字段见 [`UNNotificationSettings`](#unnotificationsettings)。

```js
center.getNotificationSettings().then((settings) => {
  console.log(settings.authorizationStatus, settings.soundSetting);
});
```

**效果**：输出授权状态和声音这一项的状态。从没申请过授权时各项的值**未在模拟器验证**。

#### `addNotificationRequest(request)`

把一条通知交给系统。`request` 是 `UNNotificationRequest`。返回 `Promise<void>`，系统收下之后兑现；这时通知还没有送达。

标识和已有的一条相同时，替换那一条。系统对一个 App 同时保管的「还没到」的通知有数量上限，Apple 的文档没有给出这个数。

| 写法 | 报错信息 |
| --- | --- |
| 不带参数，或者给的不是请求 | `addNotificationRequest: request must be a UNNotificationRequest, got undefined` |

Promise 被拒绝的情况见[错误](#错误)。

#### `getPendingNotificationRequests()`

还没到的通知。没有参数。返回 `Promise<UNNotificationRequest[]>`。立刻送达的通知（没有 `trigger`）不会出现在这里（未在模拟器验证）。

#### `removePendingNotificationRequestsWithIdentifiers(identifiers)`、`removeAllPendingNotificationRequests()`

撤销还没到的通知：按标识，或者全部。`identifiers` 是字符串的数组，里面的值按字符串转换。没有返回值。

系统在后台执行撤销，方法立刻返回。紧接着调 `getPendingNotificationRequests()` 可能还看得到被撤销的那几条。

| 写法 | 报错信息 |
| --- | --- |
| 不是数组，`'order-1'` | `removePendingNotificationRequestsWithIdentifiers: identifiers must be an array of strings, got "order-1"` |

#### `getDeliveredNotifications()`

已经送达、还留在通知中心里的通知。没有参数。返回 `Promise<UNNotification[]>`。用户划掉的、点过的不在里面（未在模拟器验证）。

#### `removeDeliveredNotificationsWithIdentifiers(identifiers)`、`removeAllDeliveredNotifications()`

把已经送达的通知从通知中心里拿掉：按标识，或者全部。参数和报错同上面撤销的那一对。同样是系统在后台执行。

#### `setBadgeCount(count)`

把图标上的数字改成 `count`。`count` 是不小于 0 的整数，小数向零取整；`0` 是去掉数字。返回 `Promise<void>`。

用户没有允许角标时系统怎么答复，**未在模拟器验证**。

| 写法 | 报错信息 |
| --- | --- |
| 负数，`-1` | `setBadgeCount: count must not be negative, got -1` |
| 转不成有限的数，`'many'` | `setBadgeCount: count must be a finite number, got "many"` |

**事件**

两个事件都不可取消，回调在事件发生之后的下一轮执行。

| 事件 | 什么时候 | 事件对象上的字段 |
| --- | --- | --- |
| `notification` | App 在前台时到了一条通知。App 不在前台时到的没有这个事件 | `notification`：`UNNotification` |
| `notificationclick` | 用户对一条通知做了动作。启动时的那一次会补发，见[用户点了通知](#用户点了通知) | `response`：`UNNotificationResponse` |

监听别的名字不会报错：它被当成自定义事件，只有自己用 `dispatchEvent()` 派发时才会触发。

### `UNMutableNotificationContent`

`new UNMutableNotificationContent()` 创建，没有参数。不能继承。

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `title` | 字符串 | 是 | 是 | `''` | 标题，粗体的一行 |
| `subtitle` | 字符串 | 是 | 是 | `''` | 副标题，标题下面的一行 |
| `body` | 字符串 | 是 | 是 | `''` | 正文 |
| `badge` | 整数（个数）或 `null` | 是 | 是 | `null` | 通知送达时把图标上的数字改成几。`0`：去掉数字。`null`：不改 |
| `sound` | `UNNotificationSound` 或 `null` | 是 | 是 | `null` | 送达时播放的声音。只能写 `UNNotificationSound.defaultSound`（系统默认的通知声音）或 `null`（不响） |
| `threadIdentifier` | 字符串 | 是 | 是 | `''` | 分组的标识。通知中心把这个值相同的通知叠成一组。`''`：不指定，按 App 分组 |
| `userInfo` | 对象 | 是 | 是 | `{}` | 跟着通知走的数据，用户看不到 |

写入时的转换：

- 四个字符串属性：数按字符串转（`5` 得到 `'5'`），`null` 和 `undefined` 得到空串。
- `badge`：看起来像数的字符串按数转，小数向零取整。负数抛 `badge must not be negative, got -1`，转不出数的抛 `badge must be a finite number, got "many"`。
- `sound`：别的值抛 `sound must be UNNotificationSound.defaultSound or null, got "default"`。
- `userInfo`：写进去的是一份副本，之后改原来的对象不影响内容。读出来的对象是冻结的，改它抛 `TypeError`。写 `null` 等于写 `{}`。值的限制见[带上数据，点了之后拿回来](#带上数据点了之后拿回来)；值是 `undefined` 的键被略过。不是普通对象时抛 `userInfo must be a plain object, got "A1024"`。

### `UNNotificationContent`

只读的内容：从请求和通知里读出来的。字段和 `UNMutableNotificationContent` 相同，都不可写。不能 `new`。

它可以再交给 `requestWithIdentifier()` 建新的请求。从远程推送的通知里读出来的 `sound` 可能是一个不等于 `UNNotificationSound.defaultSound` 的 `UNNotificationSound`：它表示服务器指定了别的声音文件，读不出文件名，带着它的内容不能再用来建请求（未在模拟器验证）。

### `UNNotificationSound`

| 成员 | 含义 |
| --- | --- |
| `UNNotificationSound.defaultSound` | 系统默认的通知声音。只读，每次读是同一个对象 |

不能 `new`。

### 触发器

三种触发器都有只读的 `repeats`（布尔）：`true` 表示送达之后重新计时、再次送达，`false` 表示只送达一次。

#### `UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(timeInterval, options)`

过 `timeInterval` 秒之后送达。`options.repeats` 可以不带，不带是 `false`。返回的触发器有只读的 `timeInterval`（秒）和 `repeats`。

| 写法 | 报错信息 |
| --- | --- |
| 不大于 0，`0` | `triggerWithTimeInterval: timeInterval must be greater than 0, got 0` |
| 重复而且不到 60 秒 | `triggerWithTimeInterval: timeInterval must be at least 60 seconds when repeats is true, got 59` |
| 转不成有限的数，`'soon'` | `timeInterval must be a finite number, got "soon"` |

#### `UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(dateComponents, options)`

到了和 `dateComponents` 对得上的时刻送达。`options.repeats` 可以不带，不带是 `false`：只在最近的一次送达。返回的触发器有只读的 `dateComponents` 和 `repeats`。

`dateComponents` 是一个普通对象，只写要匹配的分量，值是整数（小数向零取整）。值是 `null` 或 `undefined` 的分量等于没写。读出来的 `dateComponents` 是冻结的，只有写了的那几个键。

| 分量 | 含义 |
| --- | --- |
| `year`、`month`、`day` | 年、月（1 到 12）、日（1 到 31） |
| `hour`、`minute`、`second`、`nanosecond` | 时（0 到 23）、分、秒、纳秒 |
| `weekday` | 星期几：1 是星期日，2 是星期一，7 是星期六 |
| `weekdayOrdinal` | 这个月的第几个 `weekday`：和 `weekday: 2` 一起写 2，是第二个星期一 |
| `weekOfMonth`、`weekOfYear`、`yearForWeekOfYear` | 这个月的第几周、这一年的第几周、按周算的年份 |
| `dayOfYear`、`quarter`、`era` | 这一年的第几天、季度（1 到 4）、纪元（公历的公元后是 1） |

用的是用户手机上现在的日历和时区。这里不检查分量能不能凑出一个时刻：`{ hour: 99 }` 和 `{}` 都建得出触发器，交给系统时的结果**未在模拟器验证**。

| 写法 | 报错信息 |
| --- | --- |
| 不认识的分量，`{ hours: 8 }` | `dateComponents has no component "hours"; expected one of: era / year / month / day / hour / minute / second / nanosecond / weekday / weekdayOrdinal / quarter / weekOfMonth / weekOfYear / yearForWeekOfYear / dayOfYear` |
| 不是普通对象，`'08:30'`、`new Date()` | `dateComponents must be a plain object such as { hour: 8, minute: 30 }, got "08:30"` |
| 分量转不成有限的数 | `dateComponents.hour must be a finite number, got "eight"` |

#### `UNPushNotificationTrigger`

表示这条通知是远程推送送来的。只会从系统给的通知里读到，不能创建。

`UNNotificationTrigger` 是这三个类共同的父类，不能直接创建。读回来的触发器是这个包不认识的种类（别的原生代码约定的按位置触发）时，得到的是一个 `UNNotificationTrigger`，只有 `repeats`。

### `UNNotificationRequest`

#### `UNNotificationRequest.requestWithIdentifier(identifier, options)`

建一个请求。`identifier` 按字符串转。`options.content` 必填，是 `UNMutableNotificationContent` 或 `UNNotificationContent`。`options.trigger` 是上面两种能创建的触发器之一；不带或者是 `null`，通知立刻送达。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `identifier` | 字符串 | 是 | 否 | 标识 |
| `content` | `UNNotificationContent` | 是 | 否 | 内容在建请求那一刻的副本 |
| `trigger` | 触发器或 `null` | 是 | 否 | `null`：立刻送达 |

| 写法 | 报错信息 |
| --- | --- |
| 没有 `content` | `requestWithIdentifier needs { content }` |
| `content` 是普通对象 | `requestWithIdentifier: content must be a UNNotificationContent, got an object` |
| `trigger` 不是触发器，`5` | `requestWithIdentifier: trigger must be a UNTimeIntervalNotificationTrigger, a UNCalendarNotificationTrigger or null, got 5` |

### `UNNotification`

一条已经送达的通知。只能由系统给：从 `getDeliveredNotifications()` 和两个事件里来。

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `date` | `Date` | 送达的时间。每次读得到一个新的 `Date` |
| `request` | `UNNotificationRequest` | 它来自哪个请求。远程推送的通知也有，`trigger` 是 `UNPushNotificationTrigger` |

### `UNNotificationResponse`

用户对一条通知做的动作。只能从 `notificationclick` 事件里来。

| 属性 | 类型 | 含义 |
| --- | --- | --- |
| `notification` | `UNNotification` | 是哪一条通知 |
| `actionIdentifier` | 字符串 | 做了什么，见下表 |

| `actionIdentifier` | 含义 |
| --- | --- |
| `'default'` | 用户点了通知，App 被打开 |
| `'dismiss'` | 用户把通知划掉了。系统只对登记了分类、并且分类要求报告划掉的通知报这个；分类这个包还不能登记，所以用这个包发的通知划掉时没有事件 |
| 其他字符串 | 通知上自定义按钮的标识，原样给出。自定义按钮这个包还不能登记 |

### `UNNotificationSettings`

通知设置的一份快照，只能从 `getNotificationSettings()` 来。字段全部只读。

| 属性 | 取值 | 含义 |
| --- | --- | --- |
| `authorizationStatus` | 见下表 | 用户同不同意这个 App 发通知 |
| `alertSetting` | 三态 | 展示通知的总开关 |
| `soundSetting` | 三态 | 声音 |
| `badgeSetting` | 三态 | 图标上的数字 |
| `notificationCenterSetting` | 三态 | 留在通知中心里 |
| `lockScreenSetting` | 三态 | 在锁屏上展示 |
| `carPlaySetting` | 三态 | 在 CarPlay 上展示 |
| `criticalAlertSetting` | 三态 | 紧急通知 |
| `announcementSetting` | 三态 | 由 Siri 念出来 |
| `timeSensitiveSetting` | 三态 | 时效性通知：可以穿过专注模式 |
| `scheduledDeliverySetting` | 三态 | 定时摘要：系统把通知攒到固定时间一起展示 |
| `directMessagesSetting` | 三态 | 作为直接消息穿过专注模式 |
| `alertStyle` | `'none'`、`'banner'`、`'alert'` | 手机没锁时通知怎么出现。`'none'`：不出现。`'banner'`：横幅，几秒后自己消失。`'alert'`：留在屏幕上直到用户处理 |
| `showPreviewsSetting` | `'always'`、`'whenAuthenticated'`、`'never'` | 通知的内容什么时候显示。`'always'`：总是。`'whenAuthenticated'`：手机解锁之后。`'never'`：从不，只显示「通知」 |
| `providesAppNotificationSettings` | 布尔 | `true`：App 申请授权时带了 `'providesAppNotificationSettings'`。`false`：没带 |

「三态」是 `'enabled'`（开着）、`'disabled'`（关着）、`'notSupported'`（这个 App 没有这一项：没申请过，或者设备不支持）。

| `authorizationStatus` | 含义 |
| --- | --- |
| `'notDetermined'` | 还没问过用户 |
| `'denied'` | 用户拒绝了 |
| `'authorized'` | 用户同意了 |
| `'provisional'` | 临时授权，通知只安静地进通知中心 |
| `'ephemeral'` | 只给轻 App（App Clip）的限时授权 |

用户改了设置时没有事件：改设置要离开 App 去系统的「设置」，回来时在 `application` 的 [`active` 事件](application.md)里重新取一次。

### 错误

返回 Promise 的方法被拒绝时，给的是一个 `Error`，多三个字段：

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

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[UNUserNotificationCenter currentNotificationCenter]` | `UNUserNotificationCenter.currentNotificationCenter()` |
| `[center requestAuthorizationWithOptions:UNAuthorizationOptionAlert \| UNAuthorizationOptionSound completionHandler:^(BOOL granted, NSError *error) { … }]` | `center.requestAuthorizationWithOptions(['alert', 'sound'])`，返回 `Promise<boolean>` |
| `[center getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings *settings) { … }]` | `center.getNotificationSettings()`，返回 Promise |
| `settings.authorizationStatus == UNAuthorizationStatusAuthorized` | `settings.authorizationStatus === 'authorized'` |
| `settings.soundSetting == UNNotificationSettingEnabled` | `settings.soundSetting === 'enabled'` |
| `[[UNMutableNotificationContent alloc] init]` | `new UNMutableNotificationContent()` |
| `content.badge = @3` / `content.badge = nil` | `content.badge = 3` / `content.badge = null` |
| `content.sound = UNNotificationSound.defaultSound` | `content.sound = UNNotificationSound.defaultSound` |
| `content.userInfo = @{ @"orderId": @"A1024" }` | `content.userInfo = { orderId: 'A1024' }` |
| `[UNTimeIntervalNotificationTrigger triggerWithTimeInterval:5 repeats:NO]` | `UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5)` |
| `[UNTimeIntervalNotificationTrigger triggerWithTimeInterval:3600 repeats:YES]` | `UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true })` |
| `NSDateComponents *c = [NSDateComponents new]; c.hour = 8; c.minute = 30;` | `{ hour: 8, minute: 30 }` |
| `[UNCalendarNotificationTrigger triggerWithDateMatchingComponents:c repeats:YES]` | `UNCalendarNotificationTrigger.triggerWithDateMatchingComponents({ hour: 8, minute: 30 }, { repeats: true })` |
| `c.day == NSDateComponentUndefined` | `trigger.dateComponents.day === undefined` |
| `[UNNotificationRequest requestWithIdentifier:@"water" content:content trigger:trigger]` | `UNNotificationRequest.requestWithIdentifier('water', { content, trigger })` |
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
| `[response.actionIdentifier isEqualToString:UNNotificationDefaultActionIdentifier]` | `response.actionIdentifier === 'default'` |
| `[response.actionIdentifier isEqualToString:UNNotificationDismissActionIdentifier]` | `response.actionIdentifier === 'dismiss'` |
| `[notification.request.trigger isKindOfClass:UNPushNotificationTrigger.class]` | `notification.request.trigger instanceof UNPushNotificationTrigger` |
| `notification.date`（`NSDate`） | `notification.date`（`Date`） |
| `error.code == UNErrorCodeNotificationsNotAllowed` | `error.name === 'NotAllowedError'` |

## 还不能做的

下面这些都没有。表里的方法，调用会抛「不是函数」的 `TypeError`；属性，读到的是 `undefined`；类，读它的名字会抛 `ReferenceError`。

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 让 App 能收到远程推送：向苹果注册、拿到设备令牌 | `registerForRemoteNotifications`、`application:didRegisterForRemoteNotificationsWithDeviceToken:`，以及推送的 entitlement |
| 收到远程推送时在后台执行一段代码（静默推送） | `application:didReceiveRemoteNotification:fetchCompletionHandler:` |
| 通知上的自定义按钮、在通知上直接回复 | `UNNotificationCategory`、`UNNotificationAction`、`UNTextInputNotificationAction`、`setNotificationCategories:`、内容的 `categoryIdentifier` |
| 用户划掉通知时得到通知 | `UNNotificationCategoryOptionCustomDismissAction`（要先能登记分类） |
| 通知里带图片、音频、视频 | `UNNotificationAttachment`、内容的 `attachments` |
| 自定义的声音文件、紧急通知的声音 | `+soundNamed:`、`defaultCriticalSound` |
| 到了某个地方时送达 | `UNLocationNotificationTrigger` |
| 问一个触发器下一次是什么时候 | `nextTriggerDate` |
| 日期分量指定日历或时区 | `NSDateComponents.calendar`、`timeZone` |
| 时效性通知、通知的排序权重 | 内容的 `interruptionLevel`、`relevanceScore` |
| 按通知的内容逐条决定前台显不显示 | 在 `willPresentNotification:` 里按通知决定。现在只有一个对所有通知生效的属性 |
| 系统的通知设置里那个「在 App 里设置」按钮被点了 | `userNotificationCenter:openSettingsForNotification:` |
| 通知送达之前改它的内容、自定义通知的界面 | 通知服务扩展、通知内容扩展 |
| 标题和正文在送达时按语言取 | `+[NSString localizedUserNotificationStringForKey:arguments:]` |

## 参见

- [核心和能力包](capabilities.md)：哪些能力要单独装，装了之后还要做什么。
- [`Application`](application.md)：`active` 事件，App 回到前台时重新读通知设置。
- [`UIButton`](ui-button.md)：完整例子里用按钮触发申请。
- [枚举](enums.md)：授权状态和选项为什么是字符串和字符串数组，写错了会怎样。
- [运行时怎么工作](how-it-works.md)：事件的回调为什么在下一轮执行。
- [实现原理：通知](../internals/user-notifications.md)：哪些是值、委托什么时候装、启动时的点击怎么留着、前台显示为什么是预先设的。
