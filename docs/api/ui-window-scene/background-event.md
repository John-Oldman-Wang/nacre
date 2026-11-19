---
type: reference
native: UISceneDidEnterBackgroundNotification
---

# `UIWindowScene`：`background` 事件

**`background`** 事件在这个场景已经进入后台时派发。此时界面不再显示，系统随后可能暂停 App 的代码。

## 语法

```
scene.addEventListener('background', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是这个场景。

不能取消。

## 什么时候派发

- 用户按 Home 回到桌面、切到别的 App 时，在 [`inactive`](inactive-event.md) 之后派发。两条的先后顺序在场景上**未在模拟器验证**，在 `application` 的同名事件上实测过。
- 回调里读 [`activationState`](activationstate.md) 的值**未在模拟器验证**。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.addEventListener('background', () => {
    console.log('已经在后台');
  });
});
```

**效果**：用户按 Home，控制台输出 `已经在后台`。

## 对应的 iOS API

`UISceneDidEnterBackgroundNotification`，即 `sceneDidEnterBackground:`。

## 参见

- [`foreground`](foreground-event.md)
