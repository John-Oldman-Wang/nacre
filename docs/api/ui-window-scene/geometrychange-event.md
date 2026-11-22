---
type: reference
native: "-[UIWindowSceneDelegate windowScene:didUpdateEffectiveGeometry:]"
---

# `UIWindowScene`：`geometrychange` 事件

**`geometrychange`** 事件在场景的几何信息变了时派发，最常见的是界面转了方向。

## 语法

```
scene.addEventListener('geometrychange', (event) => { })
```

## 事件对象

[`UIWindowSceneGeometryChangeEvent`](../ui-window-scene-geometry-change-event.md)。除 `type`、`target`（这个场景）以外带一个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`previousInterfaceOrientation`](../ui-window-scene-geometry-change-event/previousinterfaceorientation.md) | 字符串 | 变化之前的方向。现在的方向读 `scene.effectiveGeometry` |

不能取消。

## 什么时候派发

- 界面转了方向时派发：用户转了手机，或者代码调了 [`requestGeometryUpdateWithPreferences()`](requestgeometryupdatewithpreferences.md)。
- **当场派发**：监听器在转屏的动画里执行。监听器里改视图的 `frame`、改约束再调 `layoutIfNeeded()`，这些改动跟着屏幕一起转过去（实测）。改动要在监听器里当场做完，放进 `setTimeout` 里的会在转完之后直接跳过去。
- 监听器执行时，视图已经是新的大小，`scene.effectiveGeometry` 也已经是新的方向（实测）。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  scene.addEventListener('geometrychange', (change) => {
    console.log(change.previousInterfaceOrientation, '→', scene.effectiveGeometry.interfaceOrientation);
  });
});
```

**效果**：从竖屏转成横屏时输出 `portrait → landscapeRight`。

## 对应的 iOS API

场景委托的 `windowScene:didUpdateEffectiveGeometry:`（iOS 26）。

## 参见

- [`effectiveGeometry`](effectivegeometry.md)
- [`requestGeometryUpdateWithPreferences()`](requestgeometryupdatewithpreferences.md)
