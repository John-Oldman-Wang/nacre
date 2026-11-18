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

这一页描述的行为还没有在模拟器或真机上运行过。来自代码的部分（参数怎么转换、写错时抛什么）照实写；涉及系统界面和认证结果的部分来自 iOS 的头文件，逐处标了「**未在模拟器验证**」。

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

## 一次认证怎么进行

1. 用 `new LAContext()` 建一个对象。
2. 调 `evaluatePolicy(策略, { localizedReason })`。系统显示认证界面，这个方法立刻返回一个 Promise。
3. 用户通过认证，Promise 兑现为 `true`。用户取消、认证失败或者设备现在认证不了，Promise 被拒绝，`err.name` 说明是哪一种。

认证界面显示期间 App 的代码照常执行，定时器照常触发。

**每次认证建一个新的 `LAContext`。** 按钮标题这些设置属于某一个对象，调过 `invalidate()` 的对象不能再用来认证。同一个对象通过认证之后再次认证时系统还会不会询问用户，**未在模拟器验证**；每次用新的对象，用户一定会被询问。

### 用哪种策略

策略决定系统允许用什么方式确认身份：

| 策略 | 系统怎么确认 | 认证不了的情况 |
| --- | --- | --- |
| `'deviceOwnerAuthentication'` | 先用生物认证；设备不支持、没录入、被锁定或者用户选了输密码时，改成输设备的锁屏密码 | 设备没有设锁屏密码 |
| `'deviceOwnerAuthenticationWithBiometrics'` | 只用生物认证 | 设备不支持生物认证、用户没有录入面容或指纹、失败次数过多被锁定、设备没有设锁屏密码 |

推荐用 `'deviceOwnerAuthentication'`：生物认证用不了的时候用户还能输锁屏密码，不会停在认证这一步过不去。

`'deviceOwnerAuthenticationWithBiometrics'` 用在 App 自己另有一种确认方式的时候，比如 App 的登录密码。这时把 [`localizedFallbackTitle`](#生物认证失败时改用-app-自己的密码) 设成那种方式的名字，用户点它时认证以 `UserFallbackError` 结束，App 再显示自己的密码输入界面。

### 第一次使用面容 ID 时系统会先询问用户

App 第一次用面容 ID 认证时，系统先弹出提示框，问用户是否允许这个 App 使用面容 ID。用户选了不允许，这一次和之后的认证都以 `BiometryNotAvailableError` 拒绝，直到用户在系统的「设置」里重新允许。触控 ID 没有这一步。这一段来自 iOS 的头文件，**未在模拟器验证**。

### 参数写错和认证没通过是两种错

| 情况 | 表现 |
| --- | --- |
| 参数写错：策略不认识、没给 `localizedReason`、`localizedReason` 是空串 | `evaluatePolicy()` 当场抛 `TypeError`，不返回 Promise，系统界面不会出现 |
| 认证没通过：用户取消、没认出来、设备现在认证不了 | 返回的 Promise 被拒绝，拒绝的是带 `name`、`code`、`domain` 的 `Error` |

Promise 不会兑现为 `false`。兑现就是通过。

## 完整例子

下面的代码从空白 App 开始，在屏幕上放一个按钮和一行文字。点按钮，系统确认身份，结果显示在那行文字上。

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/local-authentication" />

application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一个按钮，一行显示结果的文字
  const button = UIButton.buttonWithType('system');
  button.setTitle('确认付款', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  const status = new UILabel();
  status.text = '还没有确认';
  status.frame = new CGRect(40, 180, 300, 30);
  page.view.addSubview(status);

  // 2. 点击时认证
  button.addEventListener('click', async () => {
    // 每次认证建一个新的对象
    const context = new LAContext();
    try {
      // 3. 系统显示认证界面；通过了才往下走
      await context.evaluatePolicy('deviceOwnerAuthentication', {
        localizedReason: '确认付款 ¥128.00',
      });
      status.text = '已确认';
    } catch (err) {
      // 4. 没通过：按原因显示
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

## 常见用法

以下例子都在 `async` 函数里，各自建自己的 `LAContext`。

### 判断现在能不能用生物认证

```js
const context = new LAContext();
if (context.canEvaluatePolicy('deviceOwnerAuthenticationWithBiometrics')) {
  const title = context.biometryType === 'faceID' ? '用面容 ID 登录' : '用触控 ID 登录';
  console.log(title);
} else {
  console.log('现在不能用生物认证');
}
```

**效果**：设备支持生物认证、用户录入过、没有被锁定时，按设备的种类输出 `用面容 ID 登录` 或 `用触控 ID 登录`；否则输出 `现在不能用生物认证`。这一段不显示任何系统界面。

用它决定界面上要不要显示「用面容 ID 登录」这样的入口。结果要现问现用：用户可以随时去系统设置里录入或删除面容，App 回到前台之后重新问一次。

### 知道为什么不能用

```js
const context = new LAContext();
const error = context.canEvaluatePolicyError('deviceOwnerAuthenticationWithBiometrics');
if (error === null) {
  console.log('可以用生物认证');
} else if (error.name === 'BiometryNotEnrolledError') {
  console.log('还没有录入面容或指纹，请到系统设置里录入');
} else if (error.name === 'BiometryLockoutError') {
  console.log('生物认证被锁定，请先用锁屏密码解锁一次手机');
} else if (error.name === 'BiometryNotAvailableError') {
  console.log('这台设备不能用生物认证');
} else {
  console.log('现在不能用生物认证：' + error.name);
}
```

**效果**：输出一行，说明现在能不能用生物认证、不能的话是哪一种原因。这一段不显示任何系统界面。没有录入面容的模拟器上输出的是 `还没有录入面容或指纹，请到系统设置里录入`；其余几行**未在模拟器验证**。

`canEvaluatePolicyError()` 不抛异常：不能认证是一个正常的答案，它把原因作为返回值交回来。能认证时返回 `null`，所以用之前先判断是不是 `null`。返回的对象和 `evaluatePolicy()` 没通过时拒绝的那个是同一种，`name` 的取值见[认证没通过的原因](#认证没通过的原因)。

### 按没通过的原因分别处理

```js
const context = new LAContext();
try {
  await context.evaluatePolicy('deviceOwnerAuthentication', {
    localizedReason: '查看银行卡号',
  });
  console.log('通过');
} catch (err) {
  const failure = /** @type {LAError} */ (err);
  switch (failure.name) {
    case 'UserCancelError':
    case 'SystemCancelError':
    case 'AppCancelError':
      console.log('取消了，什么都不做');
      break;
    case 'PasscodeNotSetError':
      console.log('请先在系统设置里设置锁屏密码');
      break;
    default:
      console.log('没有通过：' + failure.name + '，' + failure.message);
  }
}
```

**效果**：通过时输出 `通过`。用户点取消、App 退到后台导致认证中断时输出 `取消了，什么都不做`。设备没有设锁屏密码时输出提示。其余情况输出原因的名字和系统给的说明文字。各种原因见[认证没通过的原因](#认证没通过的原因)。

### 生物认证失败时改用 App 自己的密码

```js
const context = new LAContext();
context.localizedFallbackTitle = '输入登录密码';
try {
  await context.evaluatePolicy('deviceOwnerAuthenticationWithBiometrics', {
    localizedReason: '登录小店',
  });
  console.log('通过');
} catch (err) {
  const failure = /** @type {LAError} */ (err);
  if (failure.name === 'UserFallbackError') {
    console.log('显示 App 自己的密码输入界面');
  }
}
```

**效果**（**未在模拟器验证**）：生物认证失败一次之后，认证界面上出现一个标题是「输入登录密码」的按钮。用户点它，认证界面关闭，Promise 以 `UserFallbackError` 拒绝，控制台输出 `显示 App 自己的密码输入界面`。

### 不显示备用按钮

```js
const context = new LAContext();
context.localizedFallbackTitle = '';
```

**效果**（**未在模拟器验证**）：生物认证失败之后，认证界面上只有取消按钮，没有备用按钮。

### 改取消按钮的标题

```js
const context = new LAContext();
context.localizedCancelTitle = '以后再说';
```

**效果**（**未在模拟器验证**）：认证界面上取消按钮的标题是「以后再说」。

### 刚用面容解锁过屏幕就不再询问

```js
const context = new LAContext();
context.touchIDAuthenticationAllowableReuseDuration = 10;
await context.evaluatePolicy('deviceOwnerAuthenticationWithBiometrics', {
  localizedReason: '打开小店',
});
```

**效果**（**未在模拟器验证**）：用户在 10 秒之内刚用面容 ID 或触控 ID 解锁过屏幕时，认证直接通过，不显示认证界面；超过 10 秒，照常显示。

它只认解锁屏幕的那一次生物认证，不认这个 App 或别的 App 里之前的认证。

### 取消正在进行的认证

```js
const context = new LAContext();
const pending = context.evaluatePolicy('deviceOwnerAuthentication', {
  localizedReason: '确认付款',
});
// 订单超时了，不再需要确认
setTimeout(() => { context.invalidate(); }, 30000);
try {
  await pending;
} catch (err) {
  const failure = /** @type {LAError} */ (err);
  console.log(failure.name);
}
```

**效果**（**未在模拟器验证**）：30 秒内用户没有完成认证时，认证界面关闭，控制台输出 `AppCancelError`。

## 概念

### 认证没通过的原因

`evaluatePolicy()` 的 Promise 被拒绝时，拒绝的是一个 `Error`，多三个字段。`canEvaluatePolicyError()` 返回的也是这种对象：

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
| `'NotInteractiveError'` | -1004 | 需要显示界面，而 `interactionNotAllowed` 是 `true` | 见 [`interactionNotAllowed`](#属性) |
| `'LAError'` | 其他 | 上面没有列到的原因 | 看 `code` 和 `message` |

## 成员说明

### 继承关系

`LAContext` 继承自 `NSObject`。它不能被继承，见[原生类](native-classes.md)。

### 构造

```js
const context = new LAContext();
```

没有参数。每次得到一个新的对象。

### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `biometryType` | [`LABiometryType`](#labiometrytype) | 是 | 否 | 取决于设备 | 设备支持哪一种生物认证。写它抛 `TypeError` |
| `localizedFallbackTitle` | 字符串或 `null` | 是 | 是 | `null` | 生物认证失败一次之后出现的备用按钮的标题。`null` 用系统默认的标题；空串隐藏这个按钮 |
| `localizedCancelTitle` | 字符串或 `null` | 是 | 是 | `null` | 取消按钮的标题。`null` 和空串都用系统默认的标题 |
| `touchIDAuthenticationAllowableReuseDuration` | 数，单位是秒 | 是 | 是 | `0` | 用户在这么多秒之内用生物认证解锁过屏幕，认证直接通过。`0` 是不复用。系统最多认 300 秒，写更大的值效果和 300 一样 |
| `interactionNotAllowed` | 布尔 | 是 | 是 | `false` | `true`：认证需要显示界面时不显示，Promise 以 `NotInteractiveError` 拒绝。`false`：照常显示界面 |

这些属性的值不会被系统改动，所以没有变化通知。`biometryType` 在 App 运行期间不变。

写入时的转换：

| 属性 | 写入的值怎么转 | 抛 `TypeError` 的情况 |
| --- | --- | --- |
| `localizedFallbackTitle`、`localizedCancelTitle` | `null` 和 `undefined` 是 `null`；其余按 `String()` 转，写 `5` 得到 `'5'` | 没有 |
| `touchIDAuthenticationAllowableReuseDuration` | 按 `Number()` 转，写 `'30'` 得到 `30` | 转不出有限的数：`touchIDAuthenticationAllowableReuseDuration must be a finite number, got "soon"`。负数：`touchIDAuthenticationAllowableReuseDuration must not be negative` |
| `interactionNotAllowed` | 按真假值转。`'false'` 是非空字符串，得到 `true` | 没有 |

默认值来自 iOS 的头文件和一次 macOS 上的测量，**未在模拟器验证**。

### `LABiometryType`

| 取值 | 含义 |
| --- | --- |
| `'none'` | 设备不支持生物认证 |
| `'faceID'` | 设备支持面容 ID |
| `'touchID'` | 设备支持触控 ID |
| `'opticID'` | 设备支持 Optic ID（识别虹膜）。只出现在 Apple Vision Pro 上，iPhone 上不会读到 |

### `canEvaluatePolicy(policy)`

现在能不能用这种策略认证。同步返回，不显示任何界面。

```js
const ok = new LAContext().canEvaluatePolicy('deviceOwnerAuthentication');
```

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `policy` | `'deviceOwnerAuthenticationWithBiometrics'` 或 `'deviceOwnerAuthentication'` | 策略，见[用哪种策略](#用哪种策略) |

**返回值**：布尔。`true` 表示调 `evaluatePolicy()` 时系统能开始认证；`false` 表示开始不了，原因是上面表里「认证不了的情况」之一，具体是哪一种问 `canEvaluatePolicyError()`。调过 `invalidate()` 的对象返回 `false`。

**出错情况**：策略不认识时抛 `TypeError`：

```
canEvaluatePolicy has no value "biometrics"; expected one of: deviceOwnerAuthenticationWithBiometrics / deviceOwnerAuthentication
```

### `canEvaluatePolicyError(policy)`

为什么不能用这种策略认证。同步返回，不显示任何界面。

```js
const error = new LAContext().canEvaluatePolicyError('deviceOwnerAuthenticationWithBiometrics');
console.log(error === null ? '能认证' : error.name);
```

**效果**：能认证时输出 `能认证`，不能时输出原因的名字。没有录入面容的模拟器上输出 `BiometryNotEnrolledError`。

| 参数 | 类型 | 含义 |
| --- | --- | --- |
| `policy` | `'deviceOwnerAuthenticationWithBiometrics'` 或 `'deviceOwnerAuthentication'` | 策略，见[用哪种策略](#用哪种策略) |

**返回值**：`canEvaluatePolicy()` 返回 `true` 的时候是 `null`；返回 `false` 的时候是一个 `Error` 对象，每次调用得到一个新的。它是返回值，不是抛出来的。对象上的字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `name` | 字符串 | 是哪一种原因，见下表 |
| `message` | 字符串 | 系统给的英文说明，比如 `Biometry is not enrolled.` |
| `code` | 数 | 系统的错误码原值，比如没录入是 -7 |
| `domain` | 字符串 | 固定是 `'com.apple.LocalAuthentication'` |

| `name` | 含义 |
| --- | --- |
| `'BiometryNotAvailableError'` | 设备不支持生物认证，或者用户没有允许这个 App 用面容 ID |
| `'BiometryNotEnrolledError'` | 设备支持，但用户没有录入面容或指纹 |
| `'BiometryLockoutError'` | 失败次数太多，生物认证被锁定，要先输一次锁屏密码 |
| `'PasscodeNotSetError'` | 设备没有设锁屏密码 |
| `'InvalidContextError'` | 这个对象调过 `invalidate()` |

前四种里只有 `BiometryNotEnrolledError` 在模拟器上验证过，其余三种是按系统头文件的说明列的，**未在模拟器验证**。

**出错情况**：策略不认识时抛 `TypeError`：

```
canEvaluatePolicyError has no value "biometrics"; expected one of: deviceOwnerAuthenticationWithBiometrics / deviceOwnerAuthentication
```

### `evaluatePolicy(policy, options)`

认证。系统显示认证界面。

```js
await new LAContext().evaluatePolicy('deviceOwnerAuthentication', {
  localizedReason: '确认付款',
});
```

| 参数 | 类型 | 必填 | 含义 |
| --- | --- | --- | --- |
| `policy` | 同上 | 是 | 策略 |
| `options.localizedReason` | 字符串 | 是 | 为什么要认证，一句给用户看的话，不能是空串。触控 ID 和输锁屏密码的界面显示它；面容 ID 的界面一般不显示它，设置了 `localizedFallbackTitle` 时才显示。界面的标题是 App 的名字，这句话里不用再写。不是字符串的值按 `String()` 转 |

**返回值**：`Promise<true>`。通过时兑现为 `true`；没通过时被拒绝，见[认证没通过的原因](#认证没通过的原因)。不会兑现为 `false`。

**出错情况**：参数写错时当场抛 `TypeError`，系统界面不出现：

| 情况 | 报错信息 |
| --- | --- |
| 策略不认识 | `evaluatePolicy has no value "faceID"; expected one of: deviceOwnerAuthenticationWithBiometrics / deviceOwnerAuthentication` |
| 没给 `options`，或者里面没有 `localizedReason`（值是 `undefined` 也算没有） | `evaluatePolicy needs options.localizedReason` |
| `localizedReason` 是空串或 `null` | `evaluatePolicy: localizedReason must not be empty` |

### `invalidate()`

作废这个对象。

```js
context.invalidate();
```

没有参数，没有返回值。正在进行的认证结束，它的 Promise 以 `AppCancelError` 拒绝（**未在模拟器验证**）。之后再用这个对象调 `evaluatePolicy()`，Promise 以 `InvalidContextError` 拒绝，系统界面不出现；`canEvaluatePolicy()` 返回 `false`，`canEvaluatePolicyError()` 返回的原因是 `InvalidContextError`。对同一个对象调两次不报错。

## 与 iOS 原生写法的对照

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

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 用配对的 Apple Watch 确认身份 | `LAPolicyDeviceOwnerAuthenticationWithCompanion`、`LAPolicyDeviceOwnerAuthenticationWithBiometricsOrCompanion` |
| 让钥匙串里的条目在读取前要求通过认证 | `evaluateAccessControl:operation:localizedReason:reply:`、`SecAccessControlCreateWithFlags`、`kSecUseAuthenticationContext` |
| 给钥匙串操作引出的认证界面设置默认的说明文字 | `localizedReason` 属性 |
| 知道用户录入的面容或指纹有没有变过 | `domainState`、`evaluatedPolicyDomainState` |
| 由 App 提供密码，不让系统显示密码界面 | `setCredential:type:`、`isCredentialSet:` |
| 读出系统允许的最长复用时间 | `LATouchIDAuthenticationMaximumAllowableReuseDuration`（值是 300 秒） |
| 按「权限」组织的新一套认证接口 | `LARight`、`LARightStore`、`LASecret` |

## 参见

- [配置 App](../guides/project-config.md)：`NSFaceIDUsageDescription` 写在哪、怎么按语言写
- [Keychain](keychain.md)：登录令牌存在那里。现在不能让它的条目在读取前要求认证，要自己先调 `evaluatePolicy()` 再读
- [原生类](native-classes.md)：哪些类能 `new`、为什么不能继承
- [枚举](enums.md)：策略和 `biometryType` 都是字符串，写错时怎么报
- [实现原理](../internals/local-authentication.md)：为什么是一个单独的包、各个成员为什么是这个形状
