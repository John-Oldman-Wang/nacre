---
type: reference
native: UISceneWillEnterForegroundNotification
---

# `UIWindowScene`：`foreground` 事件

**`foreground`** 事件在这个场景即将回到前台时派发。

## 语法

```
scene.addEventListener('foreground', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是这个场景。

不能取消。

## 什么时候派发

- 用户从桌面切回 App 时派发，接着派发 [`active`](active-event.md)。两条的先后顺序**未在模拟器验证**。
- App 启动时场景接入之后是否也派发，**未在模拟器验证**。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.addEventListener('foreground', () => {
    console.log('即将回到前台');
  });
});
```

**效果**：用户从桌面切回 App，控制台输出 `即将回到前台`。

## 对应的 iOS API

`UISceneWillEnterForegroundNotification`，即 `sceneWillEnterForeground:`。

## 参见

- [`background`](background-event.md)
