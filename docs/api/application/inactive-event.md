---
type: reference
native: UIApplicationWillResignActiveNotification
---

# `Application`：`inactive` 事件

**`inactive`** 事件在 App 即将离开活动状态时派发。

## 语法

```
application.addEventListener('inactive', (event) => { })
```

## 事件对象

`Event`。`target` 是 `application`，不能取消。

## 什么时候派发

- 用户回到主屏幕或切到别的 App 时派发，随后派发 [`background`](background-event.md)。
- 来电、下拉通知中心时也会派发，随后 App 可能直接回到活动状态，不派发 `background`。所以保存数据用 `background`，不用这个事件。
- 事件到达时 [`state`](state.md) 还是旧值 `'active'`（实测）。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

## 示例

```js
application.addEventListener('inactive', (e) => {
  console.log(e.type, '此刻 state =', application.state);
});
```

**结果**：用户回到主屏幕时输出 `inactive 此刻 state = active`。

## 对应的 iOS API

`UIApplicationWillResignActiveNotification`。

## 参见

- [前台、后台和运行状态](../application.md#前台后台和运行状态)
- [`UIWindowScene` 的 `inactive`](../ui-window-scene/inactive-event.md)：单个场景的同名事件
