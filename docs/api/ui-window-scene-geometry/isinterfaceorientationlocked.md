---
type: reference
native: UIWindowSceneGeometry.isInterfaceOrientationLocked
---

# `UIWindowSceneGeometry`：`isInterfaceOrientationLocked` 属性

**`isInterfaceOrientationLocked`** 属性表示界面的方向此刻是不是被锁着（iOS 26 起）。

## 值

布尔值。

- 只读。
- 页面的 [`prefersInterfaceOrientationLocked`](../ui-view-controller/prefersinterfaceorientationlocked.md) 是 `true`、而且系统同意时是 `true`。锁住的情况**未在模拟器验证**。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.effectiveGeometry.isInterfaceOrientationLocked);
});
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIWindowSceneGeometry.isInterfaceOrientationLocked`。
