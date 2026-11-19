---
type: reference
native: UISceneWillDeactivateNotification
---

# `UIWindowScene`：`inactive` 事件

**`inactive`** 事件在这个场景即将失去活跃时派发：即将进后台，或者被临时打断。

## 语法

```
scene.addEventListener('inactive', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是这个场景。

不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 用户按 Home 回到桌面、切到别的 App 时派发，接着派发 [`background`](background-event.md)。
- 下拉通知中心、来电这类临时打断也会派发，这时只有 `inactive`，没有 `background`。**临时打断的情况未在模拟器验证。**
- 回调里读 [`activationState`](activationstate.md) 已经是 `'foregroundInactive'`（实测）。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

要在进后台前保存数据，写在这里。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.addEventListener('inactive', () => {
    console.log('即将离开前台，保存数据');
  });
});
```

**效果**：用户按 Home，控制台输出 `即将离开前台，保存数据`。

## 对应的 iOS API

`UISceneWillDeactivateNotification`，即 `sceneWillResignActive:`。

## 参见

- [`active`](active-event.md)
