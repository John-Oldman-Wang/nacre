# 远程推送

这一篇讲怎么让 App 收到服务器发来的推送：装包、写 entitlement、用开了推送能力的描述文件签名、拿到设备令牌交给服务器、处理能看见的推送和静默推送。注册和令牌在 [`RemoteNotifications`](../api/remote-notifications.md) 上，静默推送的事件对象是 [`PushEvent`](../api/push-event.md)，能看见的推送到了、被点了由 [`UNUserNotificationCenter`](../api/un-user-notification-center.md) 报告。

**远程推送**是由服务器发出、经 Apple 的推送服务（APNs）送到手机上的一条消息。服务器靠**设备令牌**指明发给哪台设备上的哪个 App，令牌是 App 向 Apple 注册之后得到的一串字符。

这一篇里，注册和拿令牌在真机上实测过。真的从服务器发一条推送到手机还没有验证，推送到达之后的系统行为都标了「**未在真机验证**」。模拟器上的行为没有验证。

## 推荐的做法

- **每次启动都调 `register()`**，把拿到的令牌和上次交给服务器的比一比，不一样再交。令牌只在这次启动里有，重新安装 App 之后也会变。
- **能看见的推送要先申请展示通知的授权**，用 `@nacrejs/user-notifications` 的 `requestAuthorizationWithOptions()`。静默推送不需要授权。
- **静默推送的监听器写在入口文件的顶层**，把要做的事写成一个 `async` 函数，交给 `waitUntil()`，网络请求设超时。
- **开发时 `aps-environment` 写 `development`，上架的版本写 `production`。**

## 第一个例子

从空白 App 开始，屏幕中间显示注册的结果：拿到的令牌，或者失败的原因。做这个例子之前，先照下面两节装好包、写好 entitlement、签好名。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/push" />

const push = application.remoteNotifications;

application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 一行字，显示注册的结果
  const label = new UILabel();
  label.text = '正在注册推送…';
  label.numberOfLines = 0;
  label.textAlignment = 'center';
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(label);
  NSLayoutConstraint.activateConstraints([
    label.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    label.leadingAnchor.constraintEqualToAnchor(page.view.leadingAnchor, { constant: 20 }),
    label.trailingAnchor.constraintEqualToAnchor(page.view.trailingAnchor, { constant: -20 }),
  ]);

  // 向 Apple 注册，兑现成设备令牌
  push.register().then(
    (token) => {
      label.text = '令牌：' + token;
    },
    (err) => {
      label.text = '注册失败：' + (err instanceof Error ? err.message : String(err));
    },
  );
});
```

**效果**

- 屏幕中间先显示「正在注册推送…」。
- 签名用的描述文件开着推送能力时，变成「令牌：」加 64 个小写十六进制字符。
- 描述文件里没有推送能力时，变成「注册失败：」加系统给的原因。中文系统上是「未找到应用程序的“aps-environment”的授权字符串」。

这段代码没有作为一个整体运行过。其中 `register()` 的两种结果都在真机上实测过。

下面的例子沿用这里的 `push`。用到能看见的推送的几节还要 `@nacrejs/user-notifications`。单独试某一节时，先写这几行：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/push" />
/// <reference types="@nacrejs/user-notifications" />

const push = application.remoteNotifications;
```

## 装包和写 entitlement

```bash
npm install @nacrejs/push
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacrePush.framework`，`application.remoteNotifications` 有了。

然后在 `nacre.config.json` 里写 `aps-environment` 这条 entitlement。entitlement 是 App 向系统申请的特殊能力，签名时写进 App：

```json
{
  "name": "Shop",
  "bundleId": "com.example.app",
  "ios": {
    "entitlements": { "aps-environment": "development" }
  }
}
```

**效果**：生成的 App 带上这条 entitlement。装了包而没写它，生成时报错：`nacre: @nacrejs/push needs the entitlement aps-environment. Put it in ios.entitlements in nacre.config.json`。

| 取值 | 用在什么时候 | 令牌对应 Apple 的哪个推送服务器 |
| --- | --- | --- |
| `development` | 开发时，用开发的描述文件签名装到自己的手机上 | 测试环境 `api.sandbox.push.apple.com` |
| `production` | 上架的版本，用发布的描述文件签名 | 正式环境 `api.push.apple.com` |

两个环境的令牌不通用：`development` 的 App 拿到的令牌，服务器要发到测试环境。这一条来自 Apple 的文档。`production` **未验证**。

## 用开了推送能力的描述文件签名

**描述文件**是 Apple 发的一个文件，规定哪个包名的 App 能装在哪些设备上、能用哪些能力。App 里写了 `aps-environment`，签名用的描述文件就必须开着推送能力，否则 `register()` 被拒绝。

在 Apple 开发者网站的「Certificates, Identifiers & Profiles」里做两步：

1. 在 Identifiers 里登记一个 App ID，包名填 `nacre.config.json` 里的 `bundleId`（比如 `com.example.app`），在能力列表里勾上 Push Notifications。
2. 在 Profiles 里为这个 App ID 生成一个开发用的描述文件，选上你的开发证书和要装的手机，下载下来。

然后在 Xcode 里打开生成的工程，在 Signing & Capabilities 里用这个描述文件签名，装到手机上。

**效果**：`register()` 兑现成令牌（实测）。

- App ID 必须写完整的包名。通配的 App ID（包名写成 `com.example.*` 的那种）不能打开推送，用它的描述文件签名时 `register()` 被拒绝（实测）。
- 上架时在 Profiles 里生成发布用的描述文件，`aps-environment` 改成 `production`。

## 把令牌交给服务器

令牌只在这次启动里有，运行时不替 App 保存它。每次启动都注册，和上次交给服务器的比一比，不一样再交：

```js
async function syncPushToken() {
  const token = await push.register();
  if (application.storage.get('pushToken') === token) return;
  const response = await fetch('https://api.example.com/push-tokens', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  application.storage.set('pushToken', token);
}

syncPushToken().catch((err) => {
  console.log('推送令牌没交上去', err instanceof Error ? err.message : String(err));
});
```

**效果**：第一次启动时把令牌交给服务器，并记下它。之后每次启动，令牌没变就不再交。重新安装 App 之后令牌不一样（实测），会再交一次。交失败了不记，下次启动再试。

- 用户登录之后，把令牌和账号一起交给服务器，服务器才知道给谁发。退出登录时让服务器删掉这台设备的令牌。
- `register()` 不弹提示框，在入口文件的顶层调就可以。
- 系统一直不回应时 `register()` 一直等着。

## 令牌变了

令牌和 `token` 原来的值不一样时，`application.remoteNotifications` 派发 [`tokenchange`](../api/remote-notifications/tokenchange-event.md)：

```js
push.addEventListener('tokenchange', () => {
  console.log('令牌变了', push.token);
});
```

**效果**：每次启动第一次拿到令牌时输出一次，因为 `token` 每次启动先是 `null`。之后同一次启动里再拿到一样的令牌，不输出。

令牌都由 `register()` 拿到，所以上一节在 `register()` 的结果里比对就够了。`tokenchange` 适合把「令牌有了」和「交给服务器」写在两个地方的代码。

## 服务器怎么发

这一节讲服务器那一侧要做的事，App 的代码不用改。这一节的内容来自 Apple 的文档，**未验证**。

服务器用 HTTP/2 向 Apple 的推送服务器发请求，地址是 `/3/device/<令牌>`，测试环境和正式环境的服务器见上面的表。请求要带一个认证：在 Apple 开发者网站的 Keys 里生成一个开了 Apple Push Notifications service 的密钥，服务器用它签名。请求头里：

| 请求头 | 写什么 |
| --- | --- |
| `apns-topic` | App 的包名，比如 `com.example.app` |
| `apns-push-type` | 能看见的推送写 `alert`，静默推送写 `background` |
| `apns-priority` | 静默推送写 `5` |

请求体是推送的内容。能看见的推送：

```json
{
  "aps": { "alert": { "title": "订单已发货", "body": "A1024 已经交给快递" }, "sound": "default" },
  "orderId": "A1024"
}
```

**效果**：手机上出现一条横幅，标题「订单已发货」，正文「A1024 已经交给快递」，播放默认的声音。`aps` 以外的 `orderId` 是服务器自己的数据，App 在通知的 `userInfo` 里读到它。**未在真机验证。**

静默推送：

```json
{ "aps": { "content-available": 1 }, "orderId": "A1024" }
```

**效果**：手机上什么都不显示，App 收到 `push` 事件，`event.data.orderId` 是 `'A1024'`。**未在真机验证。**

## 能看见的推送：申请授权、到了、被点了

能看见的推送到了、被点了，和本地通知一样由 `@nacrejs/user-notifications` 的 [`UNUserNotificationCenter`](../api/un-user-notification-center.md) 报告。展示它要用户同意这个 App 发通知，先装 `@nacrejs/user-notifications`：

```bash
npm install @nacrejs/user-notifications
```

**效果**：工程里多嵌一个 `NacreUserNotifications.framework`，有了 `UNUserNotificationCenter`。

然后申请授权，监听用户点了推送：

```js
const center = UNUserNotificationCenter.currentNotificationCenter();

center.addEventListener('notificationclick', (event) => {
  const request = event.response.notification.request;
  if (request.trigger instanceof UNPushNotificationTrigger) {
    console.log('点了推送', String(request.content.userInfo.orderId));
  }
});

async function enablePush() {
  const granted = await center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
  console.log('允许通知', granted);
  const token = await push.register();
  console.log('令牌', token);
}
```

**效果**（**未在真机验证**）

- 调 `enablePush()` 时，还没问过的话系统弹出提示框，问是否允许这个 App 发通知。用户选完之后输出 `允许通知 true` 或 `允许通知 false`，然后注册，输出令牌。令牌照[把令牌交给服务器](#把令牌交给服务器)交给服务器。
- 用户允许之后，上一节那条推送在手机上显示成横幅。用户点它，输出 `点了推送 A1024`。
- 用户不允许时，注册照样成功，令牌照样能交给服务器，但能看见的推送不显示。
- App 是被这次点击启动的也收得到这次点击。

推送的内容在 `request.content.userInfo` 里，是服务器发出的那个 JSON 对象。App 开着时到的推送怎么显示、什么时候申请授权，见[发本地通知](local-notifications.md)。

## 静默推送

静默推送不显示任何东西，系统在后台唤醒 App，让它做一件事，比如在用户打开 App 之前把新数据拉下来。它要三样东西：

**1. 在 `nacre.config.json` 里声明后台模式。**

```json
{
  "ios": {
    "entitlements": { "aps-environment": "development" },
    "infoPlist": { "UIBackgroundModes": ["remote-notification"] }
  }
}
```

**效果**：App 的 Info.plist 里多一项后台模式 `remote-notification`。系统只在 App 声明了它时，才为静默推送唤醒 App。这一条来自 Apple 的文档，**未在真机验证**。

**2. 服务器发的内容里带 `"content-available": 1`**，请求头见[服务器怎么发](#服务器怎么发)。

**3. 在入口文件的顶层监听 `push`，用 `waitUntil()` 让系统等。**

```js
async function refreshOrders() {
  const response = await fetch('https://api.example.com/orders', {
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error('HTTP ' + response.status);
  application.storage.set('orders', await response.text());
}

push.addEventListener('push', (event) => {
  console.log('静默推送', JSON.stringify(event.data));
  event.waitUntil(refreshOrders());
});
```

**效果**（**未在真机验证**）：一条静默推送到了时，App 在后台被唤醒，输出推送的内容，拉一次订单存起来。请求成功，系统得到「有新数据」；请求失败、服务器返回错误或者超过 20 秒，系统得到「失败了」。用户之后打开 App，直接读 `application.storage` 里的订单。

几条规则：

- **监听器写在入口文件的顶层，同步加上。** App 没在运行时，系统为这条推送在后台启动 App。监听器写在 `sceneconnect` 里、或者写在某个 `await` 之后，这条推送会按「没有新数据」处理。**未在真机验证。**
- **`waitUntil()` 在监听器里马上调。** 监听器写成 `async` 函数、在 `await` 之后才调，那时派发已经结束，调用抛 `InvalidStateError`（实测）。
- **系统等的时间有限**，Apple 的文档说大约 30 秒。网络请求设一个更短的超时。**未在真机验证。**
- 结果怎么算：`waitUntil()` 收下的 Promise 全部兑现是「有新数据」，有一个被拒绝是「失败了」，没调是「没有新数据」（实测，推送到达的那一步是模拟的）。
- 系统会限制静默推送的次数，不保证每一条都送到，Apple 的文档建议一小时不超过两三条。用户在多任务界面里把 App 划掉之后，静默推送不再唤醒它。**未在真机验证。**
- 拉到的数据存进 [`application.storage`](../api/storage.md) 或者[文件](../api/filesystem.md)，用户打开 App 时再显示。

## 停止接收推送

```js
push.unregister();
console.log(push.isRegistered);
```

**效果**：输出 `false`（实测）。这台设备收不到这个 App 的远程推送，直到再调 `register()`。

Apple 的文档建议只在很少的情况下这样做，比如 App 的新版本完全不再用推送。用户退出登录时，让服务器删掉这台设备的令牌，App 保持注册。

## 参见

- [`RemoteNotifications`](../api/remote-notifications.md)：注册、令牌、两个事件，以及怎么安装这个包
- [`PushEvent`](../api/push-event.md)：静默推送的事件对象和结果
- [`UNUserNotificationCenter`](../api/un-user-notification-center.md)：申请授权，能看见的推送到了、被点了
- [发本地通知](local-notifications.md)：App 开着时怎么显示、点了通知打开对应的页面
- [配置 App](project-config.md)：`ios.entitlements` 和 `ios.infoPlist` 的写法
