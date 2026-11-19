---
type: reference
native: ATTrackingManager
status: partial
---

# `ATTrackingManager`

**`ATTrackingManager`** 表示用户对「是否允许这个 App 跟踪自己」的答复，并负责向用户提出这个申请。

「跟踪」是 iOS 的一个专门的说法：把这个 App 收集到的用户或设备的数据，和别的公司的 App、网站收集的数据关联起来，用于投放广告或衡量广告效果；或者把这些数据交给数据中间商。iOS 规定 App 做这件事之前必须得到用户的同意。同意与否由系统记录，App 只能读，不能改。

同一个包里还有 [`ASIdentifierManager`](as-identifier-manager.md)：它给出这台设备的广告标识。用户同意了跟踪，App 才读得到真实的广告标识。

> **注意**：这两个类不在核心里，要先装 `@nacrejs/app-tracking-transparency` 这个包才有。没装的时候全局没有 `ATTrackingManager` 和 `ASIdentifierManager`，类型检查也会报找不到这两个名字。怎么装见下面「[先装上](#先装上)」。

类成员的形状、写错时的报错，在模拟器（iPhone Air）的验收里验过。授权提示框弹出来之后的行为要有人操作，来自 Apple 的文档，逐处标了「**未在模拟器验证**」。

**继承关系**：`EventTarget` → `NSObject` → `ATTrackingManager`

怎么在合适的时机申请授权，见指南[申请跟踪授权](../guides/tracking-authorization.md)。

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

只支持一种语言时，值可以直接写成一个字符串。按语言写的规则见[配置 App](../guides/project-config.md#写权限文案)。

第三步，在入口文件顶上加一行，让类型进来：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/app-tracking-transparency" />
```

**效果**：编辑器里 `ATTrackingManager` 和 `ASIdentifierManager` 有了补全和检查。少了这一行，`tsc` 报 `Cannot find name 'ATTrackingManager'`（实测）。

## 构造函数

不能用 `new` 创建。`ATTrackingManager` 没有实例，它的成员都在类上。

- `new ATTrackingManager()` 抛 `TypeError: Illegal constructor: ATTrackingManager has no instances; use ATTrackingManager.trackingAuthorizationStatus and ATTrackingManager.requestTrackingAuthorization()`。
- 继承它再 `new`，抛 `TypeError`，报错以 `Illegal constructor:` 开头。原生类都不能继承，见[原生类](native-classes.md)。

## 静态属性

[`ATTrackingManager.trackingAuthorizationStatus`](app-tracking-transparency/trackingauthorizationstatus.md) <small>只读</small>

现在的授权状态。读它不会弹出提示框。

## 静态方法

[`ATTrackingManager.requestTrackingAuthorization()`](app-tracking-transparency/requesttrackingauthorization.md)

向用户申请跟踪授权，返回 Promise，兑现成申请之后的授权状态。

## 事件

没有事件。授权状态变化时系统不通知 App：申请引起的变化从 `requestTrackingAuthorization()` 的 Promise 得到；用户在系统「设置」里的修改，在 App 回到活动状态时重新读 `trackingAuthorizationStatus`。

## 四种授权状态

授权状态是一个字符串，取下面四个值之一：

| 取值 | 含义 | 这时申请授权 | 广告标识 |
| --- | --- | --- | --- |
| `'notDetermined'` | 用户还没有答复。App 没有申请过，或者系统在用户答复之前关掉了提示框 | 弹出提示框 | 全零 |
| `'restricted'` | 设备受到限制（比如家长控制、公司的设备管理），系统不允许 App 申请 | 不弹出提示框 | 全零 |
| `'denied'` | 用户拒绝了，或者在系统设置里关掉了「允许 App 请求跟踪」 | 不弹出提示框 | 全零 |
| `'authorized'` | 用户同意了 | 不弹出提示框 | 真实的值 |

这张表来自 Apple 的文档和系统头文件里的说明，**未在模拟器验证**。「广告标识」一列见 [`advertisingIdentifier`](as-identifier-manager/advertisingidentifier.md)。

用户答复之后还可以改主意：在系统的「设置」里随时可以打开或关掉对这个 App 的授权。

## 示例

### 点按钮申请授权

下面的代码从空白 App 开始，在屏幕上放一个按钮。点它，向用户申请跟踪授权，然后输出授权状态和广告标识。运行之前先按「[先装上](#先装上)」做完那三步。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/app-tracking-transparency" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('允许个性化广告', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 240, 44);
  page.view.addSubview(button);

  button.addEventListener('click', async () => {
    console.log('申请之前：' + ATTrackingManager.trackingAuthorizationStatus);
    const status = await ATTrackingManager.requestTrackingAuthorization();
    console.log('申请之后：' + status);
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

更多写法见指南[申请跟踪授权](../guides/tracking-authorization.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `ATTrackingManager.trackingAuthorizationStatus` | `ATTrackingManager.trackingAuthorizationStatus` |
| `ATTrackingManagerAuthorizationStatusNotDetermined` | `'notDetermined'` |
| `ATTrackingManagerAuthorizationStatusRestricted` | `'restricted'` |
| `ATTrackingManagerAuthorizationStatusDenied` | `'denied'` |
| `ATTrackingManagerAuthorizationStatusAuthorized` | `'authorized'` |
| `[ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:^(ATTrackingManagerAuthorizationStatus status) { … }]` | `ATTrackingManager.requestTrackingAuthorization().then((status) => { … })` |
| Info.plist 里的 `NSUserTrackingUsageDescription` | `nacre.config.json` 的 `ios.infoPlist.NSUserTrackingUsageDescription` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 申请时让提示框带一个「更多信息」按钮（面向欧盟的用户） | `requestTrackingAuthorizationPreferringExpandedInterface:additionalInformationAction:completionHandler:`（iOS 27.2），未实现 |
| 授权状态变化时收到通知 | 系统没有提供这个通知。在 App 回到活动状态时重新读 |
| 读「限制广告跟踪」开关 | `advertisingTrackingEnabled`，iOS 14 起废弃。不提供，用 `trackingAuthorizationStatus` |
| 广告归因 | SKAdNetwork、AdAttributionKit，未实现 |
| 在 App 的隐私清单里声明「这个 App 跟踪用户」 | `PrivacyInfo.xcprivacy` 的 `NSPrivacyTracking`。由 App 自己写，见[建自己的 App](../guides/your-own-app.md) |

## 参见

- [申请跟踪授权](../guides/tracking-authorization.md)：什么时候申请、只问一次、回到前台时重新读
- [`ASIdentifierManager`](as-identifier-manager.md)：广告标识，同一个包里的另一个类
- [核心和能力包](capabilities.md)：`@nacrejs/app-tracking-transparency` 是一个能力包，能力包怎么用
- [配置 App](../guides/project-config.md)：`NSUserTrackingUsageDescription` 写在哪、怎么按语言写
- [`application`](application.md)：`state` 和 `active` 事件，判断 App 是不是在活动状态
- [实现原理](../internals/app-tracking-transparency.md)：申请授权怎么变成 Promise、全零的标识为什么不换成 `null`
