---
type: reference
native: "-[LAContext invalidate]"
---

# `LAContext`：`invalidate()` 方法

**`invalidate()`** 方法作废这个对象。正在进行的认证随之结束，之后这个对象不能再用来认证。

## 语法

```
invalidate()
```

### 参数

无。

### 返回值

无（`undefined`）。

调用之后：

- 正在进行的认证结束，它的 Promise 以 `AppCancelError` 拒绝（**未在模拟器验证**）。
- 再调 `evaluatePolicy()`，Promise 以 `InvalidContextError` 拒绝，系统界面不出现。
- `canEvaluatePolicy()` 返回 `false`，`canEvaluatePolicyError()` 返回的原因是 `InvalidContextError`。
- `biometryType` 照样读得到。

### 异常

无。对同一个对象调两次不报错。

## 示例

```js
const context = new LAContext();
const pending = context.evaluatePolicy('deviceOwnerAuthentication', {
  localizedReason: '确认付款',
});
setTimeout(() => { context.invalidate(); }, 30000);
try {
  await pending;
} catch (err) {
  const failure = /** @type {LAError} */ (err);
  console.log(failure.name);
}
```

**效果**（**未在模拟器验证**）：30 秒内用户没有完成认证时，认证界面关闭，控制台输出 `AppCancelError`。

```js
const context = new LAContext();
context.invalidate();
console.log(context.canEvaluatePolicy('deviceOwnerAuthentication'));
```

**结果**：输出 `false`。

## 对应的 iOS API

`-[LAContext invalidate]`。

## 参见

- [`LAContext()`](constructor.md)：作废之后建一个新的
- [安装 `@nacrejs/local-authentication`](../la-context.md#先装上)
