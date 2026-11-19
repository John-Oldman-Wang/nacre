# 申请跟踪授权

这一篇讲怎么用 [`ATTrackingManager`](../api/app-tracking-transparency.md) 在合适的时机向用户申请跟踪授权，以及怎么用 [`ASIdentifierManager`](../api/as-identifier-manager.md) 取广告标识。每个成员的细节在这两个类的参考页。

开始之前先装 `@nacrejs/app-tracking-transparency`，并在 `nacre.config.json` 里写 `NSUserTrackingUsageDescription`，见[先装上](../api/app-tracking-transparency.md#先装上)。

授权提示框弹出来之后的行为来自 Apple 的文档，这一篇里涉及它的效果都**未在模拟器验证**。

## 推荐的做法

- **在界面显示出来之后、由用户的操作引出申请。** App 不在活动状态时系统不弹提示框。用户答复之后，App 再申请也不会弹出提示框，所以在他明白这个 App 为什么要跟踪的时候再问，比如先显示一页自己的说明，用户点了「继续」再调 `requestTrackingAuthorization()`。
- **先读状态，再决定要不要申请。** 状态不是 `'notDetermined'` 时申请不会弹出提示框。用户已经拒绝时，界面上不要再出现「请允许跟踪」的入口；要引导他去系统的「设置」里修改。
- **用广告标识之前先比一下是不是全零。** 全零表示没有可用的标识，不要把它当成一台设备的标识上报，否则所有没授权的设备会被算成同一台。
- **不要用广告标识当用户的身份。** 用户可以随时收回授权，那之后读到的是全零。登录状态和用户身份应该来自服务器发的令牌。不涉及广告、只想区分设备时，用 [`UIDevice`](../api/ui-device.md) 的 `identifierForVendor`，它不需要用户授权。

## 第一个例子

从空白 App 开始，在屏幕上放一个按钮。点它，向用户申请跟踪授权，然后输出授权状态和广告标识。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/app-tracking-transparency" />

application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一个按钮
  const button = UIButton.buttonWithType('system');
  button.setTitle('允许个性化广告', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 240, 44);
  page.view.addSubview(button);

  // 2. 点击时申请授权
  button.addEventListener('click', async () => {
    console.log('申请之前：' + ATTrackingManager.trackingAuthorizationStatus);
    const status = await ATTrackingManager.requestTrackingAuthorization();
    console.log('申请之后：' + status);

    // 3. 同意了才有可用的广告标识
    if (status === 'authorized') {
      console.log(ASIdentifierManager.sharedManager().advertisingIdentifier);
    }
  });
});
```

**效果**（**未在模拟器验证**）：

- 屏幕左上方出现一个文字按钮「允许个性化广告」。
- 第一次点它，控制台输出 `申请之前：notDetermined`，系统弹出提示框。
- 用户选了允许，控制台输出 `申请之后：authorized`，接着输出广告标识。真机上是一个 UUID，模拟器上是 `00000000-0000-0000-0000-000000000000`。
- 用户选了不允许，控制台输出 `申请之后：denied`。
- 之后再点按钮，不再弹出提示框，直接输出上一次的结果。

## 只在还没问过时申请

```js
async function askOnce() {
  if (ATTrackingManager.trackingAuthorizationStatus !== 'notDetermined') {
    return ATTrackingManager.trackingAuthorizationStatus;
  }
  return ATTrackingManager.requestTrackingAuthorization();
}

askOnce().then((status) => {
  console.log(status);
});
```

**效果**：用户还没答复过时弹出提示框，答复之后输出 `authorized` 或 `denied`。已经答复过时不申请，直接输出现在的状态。**未在模拟器验证。**

## 取广告标识，没有就不用

```js
const ZERO = '00000000-0000-0000-0000-000000000000';

/** @returns {string | null} */
function advertisingId() {
  const id = ASIdentifierManager.sharedManager().advertisingIdentifier;
  return id === ZERO ? null : id;
}

console.log(advertisingId());
```

**效果**：用户同意了跟踪并且在真机上运行时，输出一个 UUID，形如 `6D92078A-8246-4BA4-AE5B-76104861E7DC`，字母是大写。其余情况输出 `null`。**未在模拟器验证。**

`advertisingIdentifier` 每次读都是当时的值。用户收回授权之后再读，得到的是全零，所以不要把读到的值长期保存下来当成一直有效。

## 回到前台时重新读状态

状态变了系统不通知 App。用户要离开 App 才能去「设置」改授权，所以在 App 回到活动状态时重新读一次。

```js
let last = ATTrackingManager.trackingAuthorizationStatus;

application.addEventListener('active', () => {
  const now = ATTrackingManager.trackingAuthorizationStatus;
  if (now !== last) {
    console.log('授权状态从 ' + last + ' 变成了 ' + now);
    last = now;
  }
});
```

**效果**：用户切到系统的「设置」里改了对这个 App 的授权再切回来，控制台输出一行，比如 `授权状态从 authorized 变成了 denied`。没改就什么都不输出。**未在模拟器验证。**

`active` 事件在 App 每次进入活动状态时派发，见 [`application`](../api/application.md#前台后台和运行状态)。

## 处理申请失败

```js
ATTrackingManager.requestTrackingAuthorization().then(
  (status) => {
    console.log(status);
  },
  (err) => {
    console.log('申请没有发出去：' + err.message);
  },
);
```

**效果**：正常情况下输出授权状态。App 的 Info.plist 里没有 `NSUserTrackingUsageDescription` 时走第二个回调，输出运行时给的说明。**未在模拟器验证。**

用 CLI 生成的工程不会走到第二个回调：缺这句说明时生成就已经报错了。它是给自己搭 Xcode 工程、把 framework 拖进去的情况准备的。

## 参见

- [`ATTrackingManager`](../api/app-tracking-transparency.md)：授权状态和申请
- [`ASIdentifierManager`](../api/as-identifier-manager.md)：广告标识
- [配置 App](project-config.md#写权限文案)：`NSUserTrackingUsageDescription` 怎么写
- [`application`](../api/application.md)：`state` 和 `active` 事件
