---
type: reference
native: ATTrackingManager.trackingAuthorizationStatus
---

# `ATTrackingManager.trackingAuthorizationStatus` 静态属性

**`ATTrackingManager.trackingAuthorizationStatus`** 静态属性是用户对「是否允许这个 App 跟踪」的答复，也就是现在的授权状态。读它不会弹出提示框。

## 值

字符串，下面四个之一。各取值的含义、这时申请会不会弹出提示框，见[四种授权状态](../app-tracking-transparency.md#四种授权状态)：

| 取值 | 含义 |
| --- | --- |
| `'notDetermined'` | 用户还没有答复 |
| `'restricted'` | 设备受到限制，系统不允许 App 申请 |
| `'denied'` | 用户拒绝了 |
| `'authorized'` | 用户同意了 |

- 只读。给它赋值抛 `TypeError`，状态不变。
- 没有默认值，由系统记录。App 第一次运行、还没申请过时是 `'notDetermined'`（**未在模拟器验证**）。
- 可以在任何时候读，包括脚本顶层。写在脚本顶层读**未在模拟器验证**。

### 怎么得知它变了

状态变化没有事件：系统不提供这个通知。

- 申请引起的变化，从 [`requestTrackingAuthorization()`](requesttrackingauthorization.md) 的 Promise 得到。
- 用户在系统「设置」里的修改：用户要离开 App 才能去「设置」，所以在 App 回到活动状态时（[`application`](../application.md) 的 `active` 事件）重新读一次就能得到新的值。

## 示例

```js
const status = ATTrackingManager.trackingAuthorizationStatus;
console.log(status);
```

**效果**：控制台输出四个状态之一，比如 `notDetermined`。不弹出提示框。

```js
let last = ATTrackingManager.trackingAuthorizationStatus;

application.addEventListener('active', () => {
  const now = ATTrackingManager.trackingAuthorizationStatus;
  if (now !== last) {
    console.log('授权状态从 ' + last + ' 变成了 ' + now);
    last = now;
  }
});
```

**效果**：用户切到系统的「设置」里改了对这个 App 的授权再切回来，控制台输出一行，比如 `授权状态从 authorized 变成了 denied`。没改就什么都不输出。**未在模拟器验证。**

## 对应的 iOS API

`ATTrackingManager.trackingAuthorizationStatus`。`ATTrackingManagerAuthorizationStatusNotDetermined` 写成 `'notDetermined'`，其余同理。

## 参见

- [`requestTrackingAuthorization()`](requesttrackingauthorization.md)：申请授权
- [回到前台时重新读状态](../../guides/tracking-authorization.md#回到前台时重新读状态)
- [安装 `@nacrejs/app-tracking-transparency`](../app-tracking-transparency.md#先装上)
