---
type: reference
native: "-[LAContext canEvaluatePolicy:error:]"
---

# `LAContext`：`canEvaluatePolicyError()` 方法

**`canEvaluatePolicyError()`** 方法回答为什么不能用某种策略认证。它同步返回，不显示任何界面。

不能认证是一个正常的答案，所以原因作为返回值交回来，不抛出来。

## 语法

```
canEvaluatePolicyError(policy)
```

### 参数

**`policy`**

策略，`'deviceOwnerAuthenticationWithBiometrics'` 或 `'deviceOwnerAuthentication'`，见[策略](../la-context.md#策略)。

### 返回值

- [`canEvaluatePolicy()`](canevaluatepolicy.md) 返回 `true` 的时候是 `null`。
- 返回 `false` 的时候是一个 [`NSError`](../ns-error.md)，每次调用得到一个新的。它和 `evaluatePolicy()` 没通过时拒绝的是同一种，带 `name`、`message`、`code`、`domain`，见[认证没通过的原因](../la-context.md#认证没通过的原因)。`message` 是系统给的说明，比如 `Biometry is not enrolled.`；`domain` 固定是 `'com.apple.LocalAuthentication'`。

这时 `name` 是下面几种之一：

| `name` | 含义 |
| --- | --- |
| `'BiometryNotAvailableError'` | 设备不支持生物认证，或者用户没有允许这个 App 用面容 ID |
| `'BiometryNotEnrolledError'` | 设备支持，但用户没有录入面容或指纹 |
| `'BiometryLockoutError'` | 失败次数太多，生物认证被锁定，要先输一次锁屏密码 |
| `'PasscodeNotSetError'` | 设备没有设锁屏密码 |
| `'InvalidContextError'` | 这个对象调过 `invalidate()` |

`BiometryNotEnrolledError` 和 `InvalidContextError` 在模拟器上验证过。其余三种是按系统头文件的说明列的，**未在模拟器验证**。

### 异常

**`TypeError`**

策略不认识、没传、或者不是字符串：

```
canEvaluatePolicyError has no value "biometrics"; expected one of: deviceOwnerAuthenticationWithBiometrics / deviceOwnerAuthentication
```

## 示例

```js
const context = new LAContext();
const error = context.canEvaluatePolicyError('deviceOwnerAuthenticationWithBiometrics');
console.log(error === null ? '能认证' : error.name);
```

**结果**：能认证时输出 `能认证`，不能时输出原因的名字。没有录入面容的模拟器上输出 `BiometryNotEnrolledError`。

## 对应的 iOS API

`-[LAContext canEvaluatePolicy:error:]` 的出参 `error`。返回值那一半由 [`canEvaluatePolicy()`](canevaluatepolicy.md) 返回。

## 参见

- [知道为什么不能用](../../guides/face-id.md#知道为什么不能用)
- [安装 `@nacrejs/local-authentication`](../la-context.md#先装上)
