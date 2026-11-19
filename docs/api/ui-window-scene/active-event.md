---
type: reference
native: UISceneDidActivateNotification
---

# `UIWindowScene`：`active` 事件

**`active`** 事件在这个场景已经变为活跃、用户可以交互时派发。

## 语法

```
scene.addEventListener('active', (event) => { })
```

## 事件对象

`Event`。只有 `type` 和 `target` 两个字段，`target` 是这个场景。

不能取消。

## 什么时候派发

- 用户从桌面切回 App 时，在 [`foreground`](foreground-event.md) 之后派发。两条的先后顺序**未在模拟器验证**。
- 临时打断（比如下拉通知中心）结束时也派发。**未在模拟器验证。**
- App 启动时场景接入之后是否也派发，**未在模拟器验证**。
- 回调稍后执行，见[运行时怎么工作](../how-it-works.md#事件)。

回到前台要刷新的数据，写在这里。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.addEventListener('active', () => {
    console.log('可以交互了，刷新数据');
  });
});
```

**效果**：用户从桌面切回 App，控制台输出 `可以交互了，刷新数据`。

## 对应的 iOS API

`UISceneDidActivateNotification`，即 `sceneDidBecomeActive:`。

## 参见

- [`inactive`](inactive-event.md)
