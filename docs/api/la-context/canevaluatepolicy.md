---
type: reference
native: "-[LAContext canEvaluatePolicy:error:]"
---

# `LAContext`：`canEvaluatePolicy()` 方法

**`canEvaluatePolicy()`** 方法回答现在能不能用某种策略认证。它同步返回，不显示任何界面。

## 语法

```
canEvaluatePolicy(policy)
```

### 参数

**`policy`**

策略，`'deviceOwnerAuthenticationWithBiometrics'` 或 `'deviceOwnerAuthentication'`，见[策略](../la-context.md#策略)。

### 返回值

布尔。

- `true`：调 `evaluatePolicy()` 时系统能开始认证。
- `false`：开始不了，原因是[策略](../la-context.md#策略)表里「认证不了的情况」之一。具体是哪一种，问 [`canEvaluatePolicyError()`](canevaluatepolicyerror.md)。
- 调过 [`invalidate()`](invalidate.md) 的对象返回 `false`。

结果会变：用户可以随时去系统设置里录入或删除面容。要用的时候再问。

### 异常

**`TypeError`**

策略不认识、没传、或者不是字符串：

```
canEvaluatePolicy has no value "biometrics"; expected one of: deviceOwnerAuthenticationWithBiometrics / deviceOwnerAuthentication
```

## 示例

```js
const context = new LAContext();
console.log(context.canEvaluatePolicy('deviceOwnerAuthenticationWithBiometrics'));
console.log(context.canEvaluatePolicy('deviceOwnerAuthentication'));
```

**结果**：输出两个布尔。没有录入面容、也没有设锁屏密码的模拟器上，第一行是 `false`。

## 对应的 iOS API

`-[LAContext canEvaluatePolicy:error:]` 的返回值。出参 `error` 由 [`canEvaluatePolicyError()`](canevaluatepolicyerror.md) 返回。

## 参见

- [`canEvaluatePolicyError()`](canevaluatepolicyerror.md)：为什么不能
- [判断现在能不能用生物认证](../../guides/face-id.md#判断现在能不能用生物认证)
- [安装 `@nacrejs/local-authentication`](../la-context.md#先装上)
