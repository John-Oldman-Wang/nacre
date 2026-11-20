---
type: reference
native: UIStatusBarManager.statusBarFrame
---

# `UIStatusBarManager`：`statusBarFrame` 属性

**`statusBarFrame`** 属性是状态栏占的区域。

## 值

[`CGRect`](../cg-rect.md)，单位 pt，屏幕坐标。

- 只读。
- 状态栏藏着时高度是 0。**未在模拟器验证。**
- 摆放内容时不要用它算位置，用视图的安全区：安全区还考虑了灵动岛、刘海和底部横条。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.statusBarManager.statusBarFrame.height);
});
```

**结果**：输出状态栏的高度。具体的数**未记录**。

## 对应的 iOS API

`UIStatusBarManager.statusBarFrame`。
