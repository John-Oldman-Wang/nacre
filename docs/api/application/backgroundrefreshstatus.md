---
type: reference
native: UIApplication.backgroundRefreshStatus
---

# `Application`：`backgroundRefreshStatus` 属性

**`backgroundRefreshStatus`** 属性表示 App 能不能在后台刷新内容。

## 值

字符串：

| 取值 | 含义 |
| --- | --- |
| `'available'` | 用户允许后台刷新 |
| `'denied'` | 用户在系统设置里关掉了这个 App 的后台刷新 |
| `'restricted'` | 被设备的限制策略禁止，比如家长控制。用户自己改不了 |
| `'unknown'` | 系统返回了运行时不认识的值。正常情况下读不到 |

- 只读。给它赋值抛 `TypeError`。
- 变化时派发 [`backgroundrefreshstatuschange`](backgroundrefreshstatuschange-event.md)。
- 读到的具体值**未在模拟器验证**。

## 示例

```js
if (application.backgroundRefreshStatus !== 'available') {
  console.log('后台刷新不可用');
}
```

**结果**：后台刷新不可用时输出一行。

## 对应的 iOS API

`UIApplication.backgroundRefreshStatus`。`UIBackgroundRefreshStatusAvailable` 写成 `'available'`，其余同理。

## 参见

- [`backgroundrefreshstatuschange`](backgroundrefreshstatuschange-event.md)
