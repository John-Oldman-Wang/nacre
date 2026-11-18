---
type: reference
native: ATTrackingManager
status: partial
---

# 跟踪授权和广告标识

**`ATTrackingManager`** 表示用户对「是否允许这个 App 跟踪自己」的答复，并负责向用户提出这个申请。**`ASIdentifierManager`** 给出这台设备的广告标识。

「跟踪」是 iOS 的一个专门的说法：把这个 App 收集到的用户或设备的数据，和别的公司的 App、网站收集的数据关联起来，用于投放广告或衡量广告效果；或者把这些数据交给数据中间商。iOS 规定 App 做这件事之前必须得到用户的同意，同意与否由系统记录，App 只能读，不能改。

「广告标识」是系统给设备的一个 UUID。同一台设备上所有 App 读到的值相同，广告平台用它判断两次广告展示是不是发生在同一台设备上。用户没有同意跟踪时，App 读到的是全零的值 `'00000000-0000-0000-0000-000000000000'`。

> **注意**：这两个类不在核心里，要先装 `@nacrejs/app-tracking-transparency` 这个包才有。没装的时候全局没有 `ATTrackingManager` 和 `ASIdentifierManager`，类型检查也会报找不到这两个名字。怎么装见下面「[先装上](#先装上)」。

两个类都不能用 `new` 创建。`ATTrackingManager` 没有实例，它的两个成员都在类上。`ASIdentifierManager` 只有系统提供的一个实例，从 `ASIdentifierManager.sharedManager()` 取。

类方法和属性的形状、写错时的报错、没授权时广告标识是全零，在模拟器（iPhone Air）的验收里验过。授权提示框弹出来之后的行为要有人操作，来自 Apple 的文档，下面逐处标了「**未在模拟器验证**」。

## 先装上

第一步，在项目里装这个包：

```bash
npm install @nacrejs/app-tracking-transparency
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacreAppTrackingTransparency.framework`。不装的项目，App 不包含它。

第二步，在 `nacre.config.json` 里写一句说明，告诉用户为什么要跟踪。键名是 `NSUserTrackingUsageDescription`：

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": {
    "languages": ["en", "zh-Hans"],
    "infoPlist": {
      "NSUserTrackingUsageDescription": {
        "en": "Your data is used to show you more relevant ads.",
        "zh-Hans": "用于向你展示更相关的广告。"
      }
    }
  }
}
```

**效果**：系统的提示框里，标题下面显示这句话，手机是简体中文时显示中文的那一句。提示框在屏幕上的样子**未在模拟器验证**。

这句话必须写。装了这个包而没有写它，生成 `ios/` 时报错并停下，实测的报错是：

```
nacre: @nacrejs/app-tracking-transparency needs NSUserTrackingUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

只支持一种语言时，值可以直接写成一个字符串。按语言写的规则见[配置 App](../guides/project-config.md)。

第三步，在入口文件顶上加一行，让类型进来：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/app-tracking-transparency" />
```

**效果**：编辑器里 `ATTrackingManager` 和 `ASIdentifierManager` 有了补全和检查。少了这一行，`tsc` 报 `Cannot find name 'ATTrackingManager'`（实测）。

## 四种授权状态

`ATTrackingManager.trackingAuthorizationStatus` 是一个字符串，取下面四个值之一。读它不会弹出提示框。

| 取值 | 含义 | 这时申请授权 | 广告标识 |
| --- | --- | --- | --- |
| `'notDetermined'` | 用户还没有答复。App 没有申请过，或者系统在用户答复之前关掉了提示框 | 弹出提示框 | 全零 |
| `'restricted'` | 设备受到限制（比如家长控制、公司的设备管理），系统不允许 App 申请 | 不弹出提示框 | 全零 |
| `'denied'` | 用户拒绝了 | 不弹出提示框 | 全零 |
| `'authorized'` | 用户同意了 | 不弹出提示框 | 真实的值 |

这张表来自 Apple 的文档和系统头文件里的说明，**未在模拟器验证**。

模拟器上广告标识总是全零，和授权状态无关（来自 Apple 的文档，**未在模拟器验证**）。要看到真实的值，得在真机上运行。

## 什么时候弹出提示框

`ATTrackingManager.requestTrackingAuthorization()` 向用户申请授权。它返回 Promise，兑现成申请之后的授权状态。

状态是 `'notDetermined'` 时，系统弹出提示框。提示框的标题和两个按钮由系统提供，App 能决定的只有标题下面那句说明（`NSUserTrackingUsageDescription`）。用户点了按钮之后 Promise 兑现，值是 `'authorized'` 或 `'denied'`。

下面几种情况系统不弹出提示框，Promise 立刻兑现成当时的状态（来自 Apple 的文档，**未在模拟器验证**）：

| 情况 | 说明 |
| --- | --- |
| 用户已经答复过 | 状态是 `'authorized'` 或 `'denied'` |
| 设备受限 | 状态是 `'restricted'` |
| 用户在系统的「设置 → 隐私与安全性 → 跟踪」里关掉了「允许 App 请求跟踪」 | 所有 App 都不能申请 |
| App 不在活动状态 | [`application.state`](application.md#前台后台和运行状态) 不是 `'active'`，比如 App 刚启动、界面还没显示出来 |
| 上一次申请还在等用户答复 | 提示框正显示着 |

用户答复之后还可以改主意：在系统的「设置」里随时可以打开或关掉对这个 App 的授权。状态变了系统不通知 App，所以没有对应的事件。用户要离开 App 才能去「设置」，因此在 App 回到活动状态时重新读一次 `trackingAuthorizationStatus` 就能得到新的值，写法见[回到前台时重新读状态](#回到前台时重新读状态)。

## 推荐的做法

**在界面显示出来之后、由用户的操作引出申请。** App 不在活动状态时系统不弹提示框。用户答复之后，App 再申请也不会弹出提示框，所以在他明白这个 App 为什么要跟踪的时候再问，比如先显示一页自己的说明，用户点了「继续」再调 `requestTrackingAuthorization()`。

**先读状态，再决定要不要申请。** 状态不是 `'notDetermined'` 时申请不会弹出提示框。用户已经拒绝时，界面上不要再出现「请允许跟踪」的入口；要引导他去系统的「设置」里修改。

**用广告标识之前先比一下是不是全零。** 全零表示没有可用的标识，不要把它当成一台设备的标识上报，否则所有没授权的设备会被算成同一台。

**不要用广告标识当用户的身份。** 用户可以随时收回授权，那之后读到的是全零。登录状态和用户身份应该来自服务器发的令牌。不涉及广告、只想区分设备时，用 [`UIDevice`](ui-device.md) 的 `identifierForVendor`，它不需要用户授权。

## 完整例子

下面的代码从空白 App 开始，在屏幕上放一个按钮。点它，向用户申请跟踪授权，然后输出授权状态和广告标识。运行之前先按「[先装上](#先装上)」做完那三步。

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

## 常见用法

以下例子都假定已经按「[先装上](#先装上)」做完了那三步。

### 读现在的状态

```js
const status = ATTrackingManager.trackingAuthorizationStatus;
console.log(status);
```

**效果**：控制台输出四个状态之一，比如 `notDetermined`。这一行不会弹出提示框，可以在任何时候读，包括脚本顶层。写在脚本顶层读**未在模拟器验证**。

### 只在还没问过时申请

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

### 取广告标识，没有就不用

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

### 回到前台时重新读状态

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

`active` 事件在 App 每次进入活动状态时派发，见 [`application`](application.md#前台后台和运行状态)。

### 处理申请失败

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

## 成员说明

### `ATTrackingManager`

```
EventTarget
  └─ NSObject
       └─ ATTrackingManager
```

没有实例，成员都在类上。

| 成员 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `ATTrackingManager.trackingAuthorizationStatus` | `'notDetermined'` \| `'restricted'` \| `'denied'` \| `'authorized'` | 是 | 否 | 现在的授权状态。各取值的含义见[四种授权状态](#四种授权状态)。读它不弹出提示框 |

给 `trackingAuthorizationStatus` 赋值抛 `TypeError`，状态不变。

状态变化没有事件：系统不提供这个通知。申请引起的变化从 `requestTrackingAuthorization()` 的 Promise 得到；用户在「设置」里的修改，在 App 回到活动状态时重新读。

#### `ATTrackingManager.requestTrackingAuthorization()`

```js
ATTrackingManager.requestTrackingAuthorization().then((status) => {
  console.log(status);
});
```

**效果**：状态是 `'notDetermined'` 时弹出系统的提示框，用户答复后输出 `authorized` 或 `denied`；其余情况不弹出提示框，输出现在的状态。**未在模拟器验证。**

- 参数：没有。
- 返回值：`Promise`，兑现成申请之后的授权状态，四个字符串之一。
- 出错：这个方法不会同步抛出异常，失败时 Promise 被拒绝，值是一个 `TypeError`：
  - App 的 Info.plist 里没有 `NSUserTrackingUsageDescription`：`requestTrackingAuthorization needs NSUserTrackingUsageDescription in Info.plist; without it the system terminates the app`
  - 系统答复了一个运行时不认识的状态（系统以后新增了状态）：`requestTrackingAuthorization: the system answered with a status this runtime does not know (…)`，括号里是系统给的数值

#### 不能创建

- `new ATTrackingManager()` 抛 `TypeError: Illegal constructor: ATTrackingManager has no instances; use ATTrackingManager.trackingAuthorizationStatus and ATTrackingManager.requestTrackingAuthorization()`
- 继承它再 `new`，抛 `TypeError`，报错以 `Illegal constructor:` 开头。原生类都不能继承，见[原生类](native-classes.md)

### `ASIdentifierManager`

```
EventTarget
  └─ NSObject
       └─ ASIdentifierManager
```

#### 取得

```js
const manager = ASIdentifierManager.sharedManager();
console.log(manager === ASIdentifierManager.sharedManager());
```

**效果**：输出 `true`。

| 成员 | 返回值 | 说明 |
| --- | --- | --- |
| `ASIdentifierManager.sharedManager()` | `ASIdentifierManager` | 类上的方法，没有参数。每次调用得到同一个对象 |

- `new ASIdentifierManager()` 抛 `TypeError: Illegal constructor: ASIdentifierManager is created by the runtime, not by new`

#### 属性

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `advertisingIdentifier` | 字符串 | 是 | 否 | 广告标识，UUID 的文字形式，字母大写，36 个字符。没有可用的标识时是 `'00000000-0000-0000-0000-000000000000'`，不是 `null` |

给 `advertisingIdentifier` 赋值抛 `TypeError`。

读到全零的情况（第一、二种在模拟器上验过，后两种来自 Apple 的文档，**未在模拟器验证**）：

- 在模拟器上运行
- App 还没有申请过授权
- 用户拒绝了
- 设备上的配置限制了广告标识

这个值变化时没有事件。它跟着授权状态走，在授权状态可能变了的时候重新读。

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `ATTrackingManager.trackingAuthorizationStatus` | `ATTrackingManager.trackingAuthorizationStatus` |
| `ATTrackingManagerAuthorizationStatusNotDetermined` | `'notDetermined'` |
| `ATTrackingManagerAuthorizationStatusRestricted` | `'restricted'` |
| `ATTrackingManagerAuthorizationStatusDenied` | `'denied'` |
| `ATTrackingManagerAuthorizationStatusAuthorized` | `'authorized'` |
| `[ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) { … }]` | `ATTrackingManager.requestTrackingAuthorization().then((status) => { … })` |
| `[ASIdentifierManager sharedManager]` | `ASIdentifierManager.sharedManager()` |
| `manager.advertisingIdentifier.UUIDString` | `manager.advertisingIdentifier` |
| Info.plist 里的 `NSUserTrackingUsageDescription` | `nacre.config.json` 的 `ios.infoPlist.NSUserTrackingUsageDescription` |

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 申请时让提示框带一个「更多信息」按钮（面向欧盟的用户） | `requestTrackingAuthorizationPreferringExpandedInterface:additionalInformationAction:completionHandler:`（iOS 27.2） | 未实现 |
| 授权状态变化时收到通知 | 系统没有提供这个通知 | 做不了，在 App 回到活动状态时重新读 |
| 读「限制广告跟踪」开关 | `advertisingTrackingEnabled`，iOS 14 起废弃 | 不提供，用 `trackingAuthorizationStatus` |
| 广告归因 | SKAdNetwork、AdAttributionKit | 未实现 |
| 在 App 的隐私清单里声明「这个 App 跟踪用户」 | `PrivacyInfo.xcprivacy` 的 `NSPrivacyTracking` | 由 App 自己写，见[建自己的 App](../guides/your-own-app.md) |

## 参见

- [配置 App](../guides/project-config.md)：`NSUserTrackingUsageDescription` 写在哪、怎么按语言写
- [`application`](application.md)：`state` 和 `active` 事件，判断 App 是不是在活动状态
- [`UIDevice`](ui-device.md)：`identifierForVendor`，不需要授权的设备标识
- [Keychain](keychain.md)：另一个要单独安装的能力包
- [实现原理](../internals/app-tracking-transparency.md)：申请授权怎么变成 Promise、全零的标识为什么不换成 `null`
