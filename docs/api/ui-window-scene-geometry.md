---
type: reference
native: UIWindowSceneGeometry
---

# `UIWindowSceneGeometry`

**`UIWindowSceneGeometry`** 表示场景在某一刻的几何信息：界面的方向、方向是不是锁着、是不是正在被拖着改大小。它是读的那一刻的值，之后不跟着变。

**继承关系**：`EventTarget` → `NSObject` → `UIWindowSceneGeometry`

## 构造函数

不能用 `new` 创建，抛 `TypeError`。从场景的 [`effectiveGeometry`](ui-window-scene/effectivegeometry.md) 读。

## 实例属性

全部只读。

| 属性 | 说明 |
| --- | --- |
| [`interfaceOrientation`](ui-window-scene-geometry/interfaceorientation.md) <small>只读</small> | 界面的方向 |
| [`isInterfaceOrientationLocked`](ui-window-scene-geometry/isinterfaceorientationlocked.md) <small>只读</small> | 方向是不是锁着 |
| [`isInteractivelyResizing`](ui-window-scene-geometry/isinteractivelyresizing.md) <small>只读</small> | 场景是不是正在被拖着改大小 |

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const geometry = e.scene.effectiveGeometry;
  console.log(geometry.interfaceOrientation, geometry.isInteractivelyResizing);
});
```

**结果**：竖着拿手机时输出 `portrait false`。

## 对应的 iOS API

`UIWindowSceneGeometry`。

## 参见

- [`UIWindowScene`](ui-window-scene.md)
- [`geometrychange`](ui-window-scene/geometrychange-event.md)
