# 用面容 ID 确认身份

这一篇讲怎么用 [`LAContext`](../api/la-context.md) 让系统确认现在拿着手机的人是机主：付款前确认、打开 App 时解锁、显示敏感信息前确认。系统用面容 ID、触控 ID 或锁屏密码确认，App 只拿到通过或没通过。每个成员的细节在 [`LAContext`](../api/la-context.md) 的参考页。

开始之前先装 `@nacrejs/local-authentication`，并在 `nacre.config.json` 里写 `NSFaceIDUsageDescription`，见[先装上](../api/la-context.md#先装上)。

这一篇里涉及系统认证界面和认证结果的效果，都来自 iOS 的头文件，**未在模拟器验证**。

## 推荐的做法

- **用 `'deviceOwnerAuthentication'` 策略。** 生物认证用不了的时候，用户还能输锁屏密码，不会停在认证这一步过不去。
- **只有 App 自己另有一种确认方式时，才用 `'deviceOwnerAuthenticationWithBiometrics'`**，比如 App 的登录密码。这时把 [`localizedFallbackTitle`](../api/la-context/localizedfallbacktitle.md) 设成那种方式的名字，用户点它时认证以 `UserFallbackError` 结束，App 再显示自己的密码输入界面。写法见[生物认证失败时改用 App 自己的密码](#生物认证失败时改用-app-自己的密码)。
- **每次认证建一个新的 `LAContext`。** 按钮标题这些设置属于某一个对象，调过 `invalidate()` 的对象不能再用来认证。每次用新的对象，用户一定会被询问。
- **能不能用生物认证，现问现用。** 用户可以随时去系统设置里录入或删除面容。App 回到前台之后重新问一次。

## 第一个例子

从空白 App 开始，在屏幕上放一个按钮和一行文字。点按钮，系统确认身份，结果显示在那行文字上。

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

下面的例子各自写成一个函数，各自建自己的 `LAContext`。

## 判断现在能不能用生物认证

```js
function biometricLoginTitle() {
  const context = new LAContext();
  if (!context.canEvaluatePolicy('deviceOwnerAuthenticationWithBiometrics')) {
    return null;
  }
  return context.biometryType === 'faceID' ? '用面容 ID 登录' : '用触控 ID 登录';
}

console.log(biometricLoginTitle() ?? '现在不能用生物认证');
```

**效果**：设备支持生物认证、用户录入过、没有被锁定时，按设备的种类输出 `用面容 ID 登录` 或 `用触控 ID 登录`；否则输出 `现在不能用生物认证`。不显示任何系统界面。

用它决定界面上要不要显示「用面容 ID 登录」这样的入口。

## 知道为什么不能用

```js
function explainBiometry() {
  const context = new LAContext();
  const error = context.canEvaluatePolicyError('deviceOwnerAuthenticationWithBiometrics');
  if (error === null) {
    return '可以用生物认证';
  }
  switch (error.name) {
    case 'BiometryNotEnrolledError':
      return '还没有录入面容或指纹，请到系统设置里录入';
    case 'BiometryLockoutError':
      return '生物认证被锁定，请先用锁屏密码解锁一次手机';
    case 'BiometryNotAvailableError':
      return '这台设备不能用生物认证';
    default:
      return '现在不能用生物认证：' + error.name;
  }
}

console.log(explainBiometry());
```

**效果**：输出一行，说明现在能不能用生物认证、不能的话是哪一种原因。不显示任何系统界面。没有录入面容的模拟器上输出 `还没有录入面容或指纹，请到系统设置里录入`；其余几行**未在模拟器验证**。

[`canEvaluatePolicyError()`](../api/la-context/canevaluatepolicyerror.md) 不抛异常，能认证时返回 `null`，所以用之前先判断是不是 `null`。

## 按没通过的原因分别处理

```js
async function showCardNumber() {
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
}
```

**效果**：通过时输出 `通过`。用户点取消、App 退到后台导致认证中断时输出 `取消了，什么都不做`。设备没有设锁屏密码时输出提示。其余情况输出原因的名字和系统给的说明文字。各种原因见[认证没通过的原因](../api/la-context.md#认证没通过的原因)。

## 生物认证失败时改用 App 自己的密码

```js
async function logIn() {
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
}
```

**效果**（**未在模拟器验证**）：生物认证失败一次之后，认证界面上出现一个标题是「输入登录密码」的按钮。用户点它，认证界面关闭，Promise 以 `UserFallbackError` 拒绝，控制台输出 `显示 App 自己的密码输入界面`。

## 不显示备用按钮

```js
function contextWithoutFallback() {
  const context = new LAContext();
  context.localizedFallbackTitle = '';
  return context;
}
```

**效果**（**未在模拟器验证**）：用这个对象认证，生物认证失败之后，认证界面上只有取消按钮，没有备用按钮。

## 改取消按钮的标题

```js
function contextWithCancelTitle() {
  const context = new LAContext();
  context.localizedCancelTitle = '以后再说';
  return context;
}
```

**效果**（**未在模拟器验证**）：用这个对象认证，认证界面上取消按钮的标题是「以后再说」。

## 刚用面容解锁过屏幕就不再询问

```js
async function openShop() {
  const context = new LAContext();
  context.touchIDAuthenticationAllowableReuseDuration = 10;
  await context.evaluatePolicy('deviceOwnerAuthenticationWithBiometrics', {
    localizedReason: '打开小店',
  });
}
```

**效果**（**未在模拟器验证**）：用户在 10 秒之内刚用面容 ID 或触控 ID 解锁过屏幕时，认证直接通过，不显示认证界面；超过 10 秒，照常显示。

它只认解锁屏幕的那一次生物认证，不认这个 App 或别的 App 里之前的认证。系统最多认 300 秒。

## 取消正在进行的认证

```js
async function confirmWithTimeout() {
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
}
```

**效果**（**未在模拟器验证**）：30 秒内用户没有完成认证时，认证界面关闭，控制台输出 `AppCancelError`。

## 参见

- [`LAContext`](../api/la-context.md)：全部属性和方法，没通过的原因
- [配置 App](project-config.md#写权限文案)：`NSFaceIDUsageDescription` 怎么写
- [Keychain](../api/keychain.md)：登录令牌存在那里。读之前先调 `evaluatePolicy()`
