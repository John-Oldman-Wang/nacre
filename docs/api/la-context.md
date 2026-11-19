---
type: reference
native: LAContext
status: partial
---

# `LAContext`

**`LAContext`** 表示一次「确认现在拿着手机的人是机主」的认证。认证由系统完成：系统显示自己的界面，用面容 ID、触控 ID 或设备的锁屏密码确认身份，然后把结果交给 App。

面容 ID（Face ID）用前置摄像头识别机主的脸，触控 ID（Touch ID）识别指纹。两者合称生物认证，一台设备只有其中一种。

App 得到的只有两种结果：通过，或者没通过和没通过的原因。脸、指纹、密码本身 App 读不到，也没有可以发给服务器核对的凭据。所以它用来做 App 内的本地确认：打开 App 时解锁、付款前确认、显示敏感信息前确认。

> **注意**：`LAContext` 不在核心里，要先装 `@nacrejs/local-authentication` 这个包才有。没装的时候全局没有 `LAContext` 这个类（`typeof LAContext` 是 `'undefined'`），类型检查也会报找不到它。怎么装见下面「[先装上](#先装上)」。

创建、属性的默认值和读写、参数写错时的报错、`invalidate()` 之后的行为，在模拟器的验收里验过。涉及系统界面和认证结果的部分来自 iOS 的头文件，逐处标了「**未在模拟器验证**」。

**继承关系**：`EventTarget` → `NSObject` → `LAContext`。它不能被继承，见[原生类](native-classes.md)。

怎么用它做一次完整的确认，见指南[用面容 ID 确认身份](../guides/face-id.md)。

## 先装上

第一步，在项目里装这个包：

```bash
npm install @nacrejs/local-authentication
```

**效果**：下次生成 `ios/` 时，工程里多嵌一个 `NacreLocalAuthentication.framework`。不装的项目，产物里没有它。

第二步，在 `nacre.config.json` 里写一句说明，告诉用户这个 App 为什么要用面容 ID：

```json
{
  "name": "Shop",
  "bundleId": "com.example.shop",
  "ios": {
    "infoPlist": {
      "NSFaceIDUsageDescription": "Confirm payments with Face ID"
    }
  }
}
```

**效果**：App 第一次用面容 ID 认证时，系统弹出提示框问用户是否允许，提示框里显示这句话（**未在模拟器验证**）。装了包而没写这一项，生成 `ios/` 时报错并停下：

```
nacre: @nacrejs/local-authentication needs NSFaceIDUsageDescription in Info.plist: a sentence shown to the user explaining why the app needs this permission. Put it in ios.infoPlist in nacre.config.json
```

这句话可以按语言各写一句，写法见[配置 App](../guides/project-config.md#写权限文案)。

第三步，在入口文件顶上加一行，让类型进来：

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/local-authentication" />
```

**效果**：编辑器里 `LAContext` 有了补全和检查。少了这一行，`tsc` 报 `Cannot find name 'LAContext'`。

## 构造函数

[`LAContext()`](la-context/constructor.md)

创建一个新的认证对象。每次认证用一个新的。

## 实例属性

还继承 `NSObject` 的属性。

| 属性 | 说明 |
| --- | --- |
| [`biometryType`](la-context/biometrytype.md) <small>只读</small> | 设备支持哪一种生物认证 |
| [`localizedFallbackTitle`](la-context/localizedfallbacktitle.md) | 生物认证失败一次之后出现的备用按钮的标题 |
| [`localizedCancelTitle`](la-context/localizedcanceltitle.md) | 认证界面上取消按钮的标题 |
| [`touchIDAuthenticationAllowableReuseDuration`](la-context/touchidauthenticationallowablereuseduration.md) | 刚用生物认证解锁过屏幕多少秒之内，认证直接通过 |
| [`interactionNotAllowed`](la-context/interactionnotallowed.md) | 认证需要显示界面时，是不显示、直接以失败结束 |

## 实例方法

还继承 `NSObject` 的方法。

| 方法 | 说明 |
| --- | --- |
| [`canEvaluatePolicy()`](la-context/canevaluatepolicy.md) | 现在能不能用某种策略认证。同步返回，不显示界面 |
| [`canEvaluatePolicyError()`](la-context/canevaluatepolicyerror.md) | 为什么不能用某种策略认证。同步返回，不显示界面 |
| [`evaluatePolicy()`](la-context/evaluatepolicy.md) | 认证。系统显示认证界面，返回 Promise |
| [`invalidate()`](la-context/invalidate.md) | 作废这个对象，结束正在进行的认证 |

## 事件

`LAContext` 没有事件。认证的结果从 [`evaluatePolicy()`](la-context/evaluatepolicy.md) 返回的 Promise 得到。

## 一次认证怎么进行

1. 用 `new LAContext()` 建一个对象。
2. 调 `evaluatePolicy(策略, { localizedReason })`。系统显示认证界面，这个方法立刻返回一个 Promise。
3. 用户通过认证，Promise 兑现为 `true`。用户取消、认证失败或者设备现在认证不了，Promise 被拒绝，`err.name` 说明是哪一种。

认证界面显示期间 App 的代码照常执行，定时器照常触发。

按钮标题这些设置属于某一个对象，调过 `invalidate()` 的对象不能再用来认证。同一个对象通过认证之后再次认证时系统还会不会询问用户，**未在模拟器验证**；每次用新的对象，用户一定会被询问。

## 策略

策略决定系统允许用什么方式确认身份。[`canEvaluatePolicy()`](la-context/canevaluatepolicy.md)、[`canEvaluatePolicyError()`](la-context/canevaluatepolicyerror.md) 和 [`evaluatePolicy()`](la-context/evaluatepolicy.md) 的第一个参数都是策略，下面两个字符串之一：

| 策略 | 系统怎么确认 | 认证不了的情况 |
| --- | --- | --- |
| `'deviceOwnerAuthentication'` | 先用生物认证；设备不支持、没录入、被锁定或者用户选了输密码时，改成输设备的锁屏密码 | 设备没有设锁屏密码 |
| `'deviceOwnerAuthenticationWithBiometrics'` | 只用生物认证 | 设备不支持生物认证、用户没有录入面容或指纹、失败次数过多被锁定、设备没有设锁屏密码 |

两种策略怎么选，见[用面容 ID 确认身份](../guides/face-id.md#推荐的做法)。

## 第一次使用面容 ID 时的询问

App 第一次用面容 ID 认证时，系统先弹出提示框，问用户是否允许这个 App 使用面容 ID，提示框里显示 `NSFaceIDUsageDescription` 那句话。用户选了不允许，这一次和之后的认证都以 `BiometryNotAvailableError` 拒绝，直到用户在系统的「设置」里重新允许。触控 ID 没有这一步。这一段来自 iOS 的头文件，**未在模拟器验证**。

## 参数写错和认证没通过

这是两种错，表现不同：

| 情况 | 表现 |
| --- | --- |
| 参数写错：策略不认识、没给 `localizedReason`、`localizedReason` 是空串 | `evaluatePolicy()` 当场抛 `TypeError`，不返回 Promise，系统界面不会出现 |
| 认证没通过：用户取消、没认出来、设备现在认证不了 | 返回的 Promise 被拒绝，拒绝的是带 `name`、`code`、`domain` 的 `Error` |

Promise 不会兑现为 `false`。兑现就是通过。

## 认证没通过的原因

`evaluatePolicy()` 的 Promise 被拒绝时，拒绝的是一个 `Error`，多三个字段。`canEvaluatePolicyError()` 返回的也是这种对象。类型定义里它叫 `LAError`。

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `name` | 字符串 | 原因的名字，下表十二个之一 |
| `message` | 字符串 | 系统给的说明文字。语言跟着 App 声明的语言走，见[配置 App](../guides/project-config.md#声明-app-支持的语言) |
| `code` | 数 | 系统的错误码原值（`LAError`） |
| `domain` | 字符串 | 系统的错误域，`'com.apple.LocalAuthentication'` |

`name` 的取值。「含义」一列来自 iOS 的头文件；只有 `InvalidContextError` 和 `BiometryNotEnrolledError` 在模拟器上实际出现过：

| `name` | `code` | 含义 | 一般怎么处理 |
| --- | --- | --- | --- |
| `'UserCancelError'` | -2 | 用户点了取消 | 什么都不做 |
| `'UserFallbackError'` | -3 | 用户点了备用按钮 | 显示 App 自己的确认方式 |
| `'SystemCancelError'` | -4 | 系统中断了认证，比如 App 退到了后台 | 什么都不做，用户回来后可以重新发起 |
| `'AppCancelError'` | -9 | 认证进行中 App 调了 `invalidate()` | 什么都不做 |
| `'AuthenticationFailedError'` | -1 | 用户没能通过认证 | 提示没有通过 |
| `'PasscodeNotSetError'` | -5 | 设备没有设锁屏密码 | 提示用户去系统设置里设置 |
| `'BiometryNotAvailableError'` | -6 | 生物认证不可用：设备不支持，或者用户没有允许这个 App 用面容 ID | 换一种确认方式 |
| `'BiometryNotEnrolledError'` | -7 | 设备支持生物认证，但用户没有录入面容或指纹 | 换一种确认方式，或者提示用户去录入 |
| `'BiometryLockoutError'` | -8 | 生物认证失败次数过多被锁定，要先输一次锁屏密码才恢复 | 改用 `'deviceOwnerAuthentication'` 再认证一次 |
| `'InvalidContextError'` | -10 | 这个对象调过 `invalidate()` | 建一个新的 `LAContext` |
| `'NotInteractiveError'` | -1004 | 需要显示界面，而 `interactionNotAllowed` 是 `true` | 见 [`interactionNotAllowed`](la-context/interactionnotallowed.md) |
| `'LAError'` | 其他 | 上面没有列到的原因 | 看 `code` 和 `message` |

## 示例

### 付款前确认身份

下面的代码从空白 App 开始，在屏幕上放一个按钮和一行文字。点按钮，系统确认身份，结果显示在那行文字上。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/local-authentication" />

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('确认付款', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  const status = new UILabel();
  status.text = '还没有确认';
  status.frame = new CGRect(40, 180, 300, 30);
  page.view.addSubview(status);

  button.addEventListener('click', async () => {
    const context = new LAContext();
    try {
      await context.evaluatePolicy('deviceOwnerAuthentication', {
        localizedReason: '确认付款 ¥128.00',
      });
      status.text = '已确认';
    } catch (err) {
      const failure = /** @type {LAError} */ (err);
      status.text = failure.name === 'UserCancelError'
        ? '已取消'
        : '没有通过：' + failure.name;
    }
  });
});
```

**效果**（这段代码没有在模拟器运行过，以下**未在模拟器验证**）：

- 屏幕左上方出现一个文字按钮「确认付款」，下面一行文字「还没有确认」。
- 点按钮，系统显示认证界面。有面容 ID 的设备直接开始识别脸；识别不了或者设备没有生物认证时，显示输入锁屏密码的界面，界面上有「确认付款 ¥128.00」这句话。
- 认证通过，那行文字变成「已确认」。
- 用户点了取消，那行文字变成「已取消」。
- 设备没有设锁屏密码，那行文字变成「没有通过：PasscodeNotSetError」，系统界面不出现。

### 判断现在能不能用生物认证

```js
const context = new LAContext();
if (context.canEvaluatePolicy('deviceOwnerAuthenticationWithBiometrics')) {
  console.log(context.biometryType === 'faceID' ? '用面容 ID 登录' : '用触控 ID 登录');
} else {
  console.log('现在不能用生物认证');
}
```

**效果**：设备支持生物认证、用户录入过、没有被锁定时，按设备的种类输出 `用面容 ID 登录` 或 `用触控 ID 登录`；否则输出 `现在不能用生物认证`。不显示任何系统界面。

更多写法见指南[用面容 ID 确认身份](../guides/face-id.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[LAContext alloc] init]` | `new LAContext()` |
| `[context canEvaluatePolicy:policy error:&error]` 的返回值 | `context.canEvaluatePolicy(policy)` |
| `[context canEvaluatePolicy:policy error:&error]` 的 `error` | `context.canEvaluatePolicyError(policy)`：能认证时是 `null`，不能时是那个错误 |
| `[context evaluatePolicy:policy localizedReason:reason reply:^(BOOL success, NSError *error) { … }]` | `await context.evaluatePolicy(policy, { localizedReason: reason })` |
| `reply` 里的 `success == NO` 和 `error` | Promise 被拒绝，`err.code` 是 `error.code`，`err.domain` 是 `error.domain`，`err.message` 是 `error.localizedDescription` |
| `[context invalidate]` | `context.invalidate()` |
| `context.biometryType` | `context.biometryType` |
| `LABiometryTypeNone` / `TouchID` / `FaceID` / `OpticID` | `'none'` / `'touchID'` / `'faceID'` / `'opticID'` |
| `LAPolicyDeviceOwnerAuthenticationWithBiometrics` | `'deviceOwnerAuthenticationWithBiometrics'` |
| `LAPolicyDeviceOwnerAuthentication` | `'deviceOwnerAuthentication'` |
| `LAErrorUserCancel` 等 | `err.name === 'UserCancelError'` 等：去掉 `LAError` 前缀，加 `Error` 后缀 |
| `context.localizedFallbackTitle`、`localizedCancelTitle`、`touchIDAuthenticationAllowableReuseDuration`、`interactionNotAllowed` | 同名属性 |

## 参见

- [用面容 ID 确认身份](../guides/face-id.md)：推荐的做法、判断能不能用、按原因处理、改用 App 自己的密码
- [核心和能力包](capabilities.md)：`@nacrejs/local-authentication` 是一个能力包，能力包怎么用
- [配置 App](../guides/project-config.md)：`NSFaceIDUsageDescription` 写在哪、怎么按语言写
- [Keychain](keychain.md)：登录令牌存在那里。读取前要确认身份时，先调 `evaluatePolicy()` 再读
- [原生类](native-classes.md)：哪些类能 `new`、不能继承
- [枚举](enums.md)：策略和 `biometryType` 都是字符串，写错时怎么报
