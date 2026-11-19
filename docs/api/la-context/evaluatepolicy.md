---
type: reference
native: "-[LAContext evaluatePolicy:localizedReason:reply:]"
---

# `LAContext`：`evaluatePolicy()` 方法

**`evaluatePolicy()`** 方法发起认证。系统显示认证界面，方法立刻返回一个 Promise，认证通过时兑现。

## 语法

```
evaluatePolicy(policy, { localizedReason })
```

### 参数

**`policy`**

策略，`'deviceOwnerAuthenticationWithBiometrics'` 或 `'deviceOwnerAuthentication'`，见[策略](../la-context.md#策略)。

**`options.localizedReason`**

为什么要认证，一句给用户看的话，字符串，必填，不能是空串。不是字符串的值按 `String()` 转。

- 触控 ID 和输锁屏密码的界面显示它。
- 面容 ID 的界面一般不显示它，设置了 [`localizedFallbackTitle`](localizedfallbacktitle.md) 时才显示。
- 界面的标题是 App 的名字，这句话里不用再写。

在界面上怎么显示，**未在模拟器验证**。

### 返回值

`Promise<true>`。

- 通过时兑现为 `true`。不会兑现为 `false`。
- 没通过时被拒绝，拒绝的是带 `name`、`code`、`domain` 的 `Error`，见[认证没通过的原因](../la-context.md#认证没通过的原因)。
- 调过 [`invalidate()`](invalidate.md) 的对象：以 `InvalidContextError` 拒绝，系统界面不出现。
- [`interactionNotAllowed`](interactionnotallowed.md) 是 `true` 而认证需要界面：以 `NotInteractiveError` 拒绝。

认证界面显示期间 App 的代码照常执行，定时器照常触发。

### 异常

**`TypeError`**

参数写错时当场抛，不返回 Promise，系统界面不出现：

| 情况 | 报错信息 |
| --- | --- |
| 策略不认识 | `evaluatePolicy has no value "faceID"; expected one of: deviceOwnerAuthenticationWithBiometrics / deviceOwnerAuthentication` |
| 没给 `options`、`options` 是 `null`，或者里面没有 `localizedReason`（值是 `undefined` 也算没有） | `evaluatePolicy needs options.localizedReason` |
| `localizedReason` 是空串或 `null` | `evaluatePolicy: localizedReason must not be empty` |

## 示例

```js
const context = new LAContext();
try {
  await context.evaluatePolicy('deviceOwnerAuthentication', {
    localizedReason: '查看银行卡号',
  });
  console.log('通过');
} catch (err) {
  const failure = /** @type {LAError} */ (err);
  console.log('没有通过：' + failure.name);
}
```

**效果**（**未在模拟器验证**）：系统显示认证界面。通过时输出 `通过`；用户点了取消输出 `没有通过：UserCancelError`；设备没有设锁屏密码时不显示界面，输出 `没有通过：PasscodeNotSetError`。

## 对应的 iOS API

`-[LAContext evaluatePolicy:localizedReason:reply:]`。`reply` 回调换成了 Promise：`success == YES` 是兑现，`NO` 是拒绝；`err.code`、`err.domain` 是 `error.code`、`error.domain`，`err.message` 是 `error.localizedDescription`。

## 参见

- [参数写错和认证没通过](../la-context.md#参数写错和认证没通过)
- [用面容 ID 确认身份](../../guides/face-id.md)：按原因处理、改用 App 自己的密码
- [安装 `@nacrejs/local-authentication`](../la-context.md#先装上)
