---
type: reference
native: UIApplicationDidBecomeActiveNotification
---

# `Application`：`active` 事件

**`active`** 事件在 App 已经进入活动状态、可以接收用户操作时派发。

## 语法

```
application.addEventListener('active', (event) => { })
```

## 事件对象

`Event`。`target` 是 `application`，不能取消。

## 什么时候派发

- App 启动、界面显示出来之后派发。
- 用户从后台切回 App 时，在 [`foreground`](foreground-event.md) 之后派发。
- 临时打断（来电、下拉通知中心）结束时派发。
- 事件到达时 [`state`](state.md) 是 `'active'`（实测）。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

## 示例

```js
for (const type of ['inactive', 'background', 'foreground', 'active']) {
  application.addEventListener(type, (e) => {
    console.log(e.type, '此刻 state =', application.state);
  });
}
```

**效果**：用户回到主屏幕，再点图标回到 App，控制台依次输出：

- `inactive 此刻 state = active`
- `background 此刻 state = background`
- `foreground 此刻 state = background`
- `active 此刻 state = active`

## 对应的 iOS API

`UIApplicationDidBecomeActiveNotification`。

## 参见

- [前台、后台和运行状态](../application.md#前台后台和运行状态)
