---
type: reference
native: UIStatusBarManager.isStatusBarHidden
---

# `UIStatusBarManager`：`isStatusBarHidden` 属性

**`isStatusBarHidden`** 属性表示状态栏此刻是不是藏着。

## 值

布尔值。

- 只读。
- 根页面的 `prefersStatusBarHidden` 设成 `true` 之后变成 `true`（实测）。
- 没有变化通知：状态栏由页面决定，页面的值是 App 自己设的。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.statusBarManager.isStatusBarHidden);
});
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIStatusBarManager.isStatusBarHidden`。
