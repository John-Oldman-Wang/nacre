---
type: reference
native: UIWindowSceneGeometry.isInteractivelyResizing
---

# `UIWindowSceneGeometry`：`isInteractivelyResizing` 属性

**`isInteractivelyResizing`** 属性表示场景是不是正在被用户拖着改大小（iOS 26 起）。

## 值

布尔值。

- 只读。
- iPhone 上场景占满屏幕，一般是 `false`（实测）。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.effectiveGeometry.isInteractivelyResizing);
});
```

**结果**：输出 `false`。

## 对应的 iOS API

`UIWindowSceneGeometry.isInteractivelyResizing`。
