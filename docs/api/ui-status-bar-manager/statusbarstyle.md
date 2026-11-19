---
type: reference
native: UIStatusBarManager.statusBarStyle
---

# `UIStatusBarManager`：`statusBarStyle` 属性

**`statusBarStyle`** 属性是状态栏此刻的样式。

## 值

字符串：`'default'`、`'darkContent'`、`'lightContent'`。

- 只读。
- 根页面的 `preferredStatusBarStyle` 设成 `'lightContent'` 之后变成 `'lightContent'`（实测）。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.statusBarManager.statusBarStyle);
});
```

**结果**：输出 `default`。

## 对应的 iOS API

`UIStatusBarManager.statusBarStyle`。
