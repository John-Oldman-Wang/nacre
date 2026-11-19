---
type: reference
native: UIStatusBarManager
---

# `UIStatusBarManager`

**`UIStatusBarManager`** 表示场景的状态栏此刻的样子：藏没藏、什么样式、占多大。它只能读；要改状态栏，设页面的 [`prefersStatusBarHidden`](ui-view-controller/prefersstatusbarhidden.md)、[`preferredStatusBarStyle`](ui-view-controller/preferredstatusbarstyle.md)。

**继承关系**：`EventTarget` → `NSObject` → `UIStatusBarManager`

## 构造函数

不能用 `new` 创建，抛 `TypeError`。从场景的 [`statusBarManager`](ui-window-scene/statusbarmanager.md) 读。

## 实例属性

全部只读，是读的那一刻的值。

| 属性 | 说明 |
| --- | --- |
| [`isStatusBarHidden`](ui-status-bar-manager/isstatusbarhidden.md) <small>只读</small> | 状态栏是不是藏着 |
| [`statusBarStyle`](ui-status-bar-manager/statusbarstyle.md) <small>只读</small> | 状态栏的样式 |
| [`statusBarFrame`](ui-status-bar-manager/statusbarframe.md) <small>只读</small> | 状态栏占的区域 |

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const bar = e.scene.statusBarManager;
  console.log(bar.isStatusBarHidden, bar.statusBarStyle);
});
```

**结果**：输出 `false default`。

## 对应的 iOS API

`UIStatusBarManager`。

## 参见

- [`UIViewController`](ui-view-controller.md)：`prefersStatusBarHidden`、`preferredStatusBarStyle`
