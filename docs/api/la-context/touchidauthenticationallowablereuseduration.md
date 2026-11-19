---
type: reference
native: LAContext.touchIDAuthenticationAllowableReuseDuration
---

# `LAContext`：`touchIDAuthenticationAllowableReuseDuration` 属性

**`touchIDAuthenticationAllowableReuseDuration`** 属性是一段时长，单位是秒。用户在这段时间之内刚用面容 ID 或触控 ID 解锁过屏幕时，认证直接通过，不显示认证界面。

它只认解锁屏幕的那一次生物认证，不认这个 App 或别的 App 里之前的认证。名字里有 `touchID`，面容 ID 同样适用。

## 值

数，单位是秒。

- 可读，可写。
- 默认值是 `0`，表示不复用：每次认证都显示界面。
- 系统最多认 300 秒。写更大的值不报错，效果和 300 一样。
- 只有 App 自己能改它，所以没有变化通知。
- 复用的效果**未在模拟器验证**。

### 写错时

写入的值按 `Number()` 转，写 `'30'` 读回 `30`。下面两种情况抛 `TypeError`，属性保持原来的值：

- 转不出有限的数（`'soon'`、`undefined`、`NaN`）：`touchIDAuthenticationAllowableReuseDuration must be a finite number, got "soon"`。
- 负数：`touchIDAuthenticationAllowableReuseDuration must not be negative`。

## 示例

```js
const context = new LAContext();
context.touchIDAuthenticationAllowableReuseDuration = 10;
await context.evaluatePolicy('deviceOwnerAuthenticationWithBiometrics', {
  localizedReason: '打开小店',
});
```

**效果**：用户在 10 秒之内刚用面容 ID 或触控 ID 解锁过屏幕时，认证直接通过，不显示认证界面；超过 10 秒，照常显示。**未在模拟器验证。**

## 对应的 iOS API

`LAContext.touchIDAuthenticationAllowableReuseDuration`。系统允许的最大值 `LATouchIDAuthenticationMaximumAllowableReuseDuration` 没有提供。

## 参见

- [`evaluatePolicy()`](evaluatepolicy.md)
- [安装 `@nacrejs/local-authentication`](../la-context.md#先装上)
