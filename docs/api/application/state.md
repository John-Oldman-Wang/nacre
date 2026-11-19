---
type: reference
native: UIApplication.applicationState
---

# `Application`：`state` 属性

**`state`** 属性是 App 的前后台状态：所有场景合在一起的状态。单个场景的状态读 [`UIWindowScene.activationState`](../ui-window-scene/activationstate.md)。

## 值

字符串：

| 取值 | 含义 |
| --- | --- |
| `'active'` | 在前台，并且在接收用户的操作 |
| `'inactive'` | 在前台，但暂时不接收操作。例如正在切换 App、来电、下拉了通知中心 |
| `'background'` | 不在屏幕上。脚本刚开始执行时也是这个值 |
| `'unknown'` | 系统返回了运行时不认识的状态值。正常情况下读不到 |

- 只读。给它赋值抛 `TypeError`。
- 在 `main.js` 顶层读是 `'background'`：脚本开始执行时场景还没有接入，系统认为 App 还不在前台。界面显示出来、App 可以操作之后再读，得到 `'active'`。
- 变化时派发 [`inactive`](inactive-event.md)、[`background`](background-event.md)、[`foreground`](foreground-event.md)、[`active`](active-event.md)。其中 `inactive` 和 `foreground` 表示「即将」，到达时 `state` 还是旧值，见[前台、后台和运行状态](../application.md#前台后台和运行状态)。

## 示例

```js
console.log(application.state);
```

**结果**：在 `main.js` 顶层执行时输出 `background`。

## 对应的 iOS API

`UIApplication.applicationState`。`UIApplicationStateActive` 写成 `'active'`，其余同理。

## 参见

- [前台、后台和运行状态](../application.md#前台后台和运行状态)
