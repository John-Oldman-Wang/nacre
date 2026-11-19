---
type: reference
native: UIWindowScene.statusBarManager
---

# `UIWindowScene`：`statusBarManager` 属性

**`statusBarManager`** 属性是这个场景的状态栏此刻的样子：藏没藏、什么样式、占多大。

## 值

[`UIStatusBarManager`](../ui-status-bar-manager.md)。

- 只读。给它赋值抛 `TypeError`。
- 同一个场景每次读到同一个对象，它的属性是读的那一刻的值。

状态栏由页面决定，要改它，设页面的 [`prefersStatusBarHidden`](../ui-view-controller/prefersstatusbarhidden.md)、[`preferredStatusBarStyle`](../ui-view-controller/preferredstatusbarstyle.md)。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.statusBarManager.isStatusBarHidden);
});
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIWindowScene.statusBarManager`。

## 参见

- [`UIStatusBarManager`](../ui-status-bar-manager.md)
