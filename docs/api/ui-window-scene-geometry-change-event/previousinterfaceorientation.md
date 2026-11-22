---
type: reference
native: UIWindowSceneGeometryChangeEvent.previousInterfaceOrientation
---

# `UIWindowSceneGeometryChangeEvent`：`previousInterfaceOrientation` 属性

**`previousInterfaceOrientation`** 属性是变化之前的界面方向。

## 值

字符串，下面之一：

- 只读。给它赋值抛 `TypeError`。
- `'portrait'`：竖着，Home 区在下。
- `'portraitUpsideDown'`：竖着倒过来。
- `'landscapeLeft'`、`'landscapeRight'`：横着的两个方向。
- `'unknown'`：方向不明。
- 现在的方向读 [`effectiveGeometry`](../ui-window-scene/effectivegeometry.md) 的 `interfaceOrientation`。
- 用 [`new`](constructor.md) 创建时没给，是 `'unknown'`。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  scene.addEventListener('geometrychange', (change) => {
    console.log(change.previousInterfaceOrientation, '→', scene.effectiveGeometry.interfaceOrientation);
  });
});
```

**效果**：把手机从竖着转成横着，输出 `portrait → landscapeRight` 这样的一行。

## 对应的 iOS API

`windowScene:didUpdateEffectiveGeometry:` 的参数 `previousEffectiveGeometry` 的 `interfaceOrientation`。

## 参见

- [`UIWindowSceneGeometryChangeEvent`](../ui-window-scene-geometry-change-event.md)
