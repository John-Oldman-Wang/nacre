---
type: reference
native: UIScene.activationState
---

# `UIWindowScene`：`activationState` 属性

**`activationState`** 属性表示这个场景此刻是否显示、能否交互。

## 值

字符串：

| 取值 | 含义 |
| --- | --- |
| `'foregroundActive'` | 在前台，正在显示，用户可以交互。App 正常使用时是这个值 |
| `'foregroundInactive'` | 在前台，正在显示，但暂时收不到用户的操作。进后台前和回前台后的短暂过渡期，以及界面被系统的东西临时盖住时（比如下拉通知中心），是这个值 |
| `'background'` | 在后台，不显示 |
| `'unattached'` | 场景没有接入 App。已经被系统销毁的旧场景读到的是这个值 |
| `'unknown'` | 系统返回了运行时不认识的状态。现有的 iOS 版本不会出现 |

- 只读。给它赋值抛 `TypeError`。
- 没有对应的「值变了」事件名。它变化时派发 [`active`](active-event.md)、[`inactive`](inactive-event.md)、[`foreground`](foreground-event.md)、[`background`](background-event.md) 四个事件，在这四个事件的回调里读它。
- 在这四个事件的回调里读到的已经是新值（实测：`inactive` 的回调里是 `'foregroundInactive'`）。App 级的 `application.state` 在同一时刻还是旧值，所以在事件回调里判断状态读这个属性。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const state = e.scene.activationState;
  if (state === 'foregroundActive') {
    console.log('在前台，可以交互');
  } else if (state === 'foregroundInactive') {
    console.log('在前台，暂时不能交互');
  } else if (state === 'background') {
    console.log('在后台');
  } else {
    console.log('其他状态:', state);
  }
});
```

**效果**：按场景此刻的状态输出其中一行。

## 对应的 iOS API

`UIScene.activationState`。`UISceneActivationStateForegroundActive` 写成 `'foregroundActive'`，其余同理。

## 参见

- [场景的状态和 App 的状态](../ui-window-scene.md#场景的状态和-app-的状态)
