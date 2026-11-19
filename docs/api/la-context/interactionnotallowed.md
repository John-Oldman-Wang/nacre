---
type: reference
native: LAContext.interactionNotAllowed
---

# `LAContext`：`interactionNotAllowed` 属性

**`interactionNotAllowed`** 属性决定认证需要显示界面时怎么办：显示界面，还是不显示、直接以失败结束。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `false` | 认证需要界面时照常显示 |
| `true` | 认证需要界面时不显示，`evaluatePolicy()` 的 Promise 以 `NotInteractiveError` 拒绝 |

- 可读，可写。
- 默认值是 `false`。
- 只有 App 自己能改它，所以没有变化通知。
- 设成 `true` 之后在模拟器上认证，Promise 被拒绝，`name` 是 `NotInteractiveError`；模拟器没有设锁屏密码时是 `PasscodeNotSetError`。真机上的表现**未验证**。

### 写错时

不抛异常。写入的值按真假值转：`0` 得到 `false`；`'false'` 是非空字符串，得到 `true`。

## 示例

```js
const context = new LAContext();
context.interactionNotAllowed = true;
try {
  await context.evaluatePolicy('deviceOwnerAuthentication', { localizedReason: '静默检查' });
  console.log('通过');
} catch (err) {
  const failure = /** @type {LAError} */ (err);
  console.log(failure.name);
}
```

**效果**：不显示认证界面。需要界面才能认证时输出 `NotInteractiveError`。

## 对应的 iOS API

`LAContext.interactionNotAllowed`。

## 参见

- [认证没通过的原因](../la-context.md#认证没通过的原因)
- [安装 `@nacrejs/local-authentication`](../la-context.md#先装上)
