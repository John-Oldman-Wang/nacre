---
type: reference
native: UIWindowScene.effectiveGeometry
---

# `UIWindowScene`：`effectiveGeometry` 属性

**`effectiveGeometry`** 属性是这个场景此刻的几何信息：界面是什么方向、方向是不是锁着。

## 值

[`UIWindowSceneGeometry`](../ui-window-scene-geometry.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读给一份新的，是读的那一刻的值，之后不跟着变。方向变了派发 [`geometrychange`](geometrychange-event.md)，在那里重新读。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.effectiveGeometry.interfaceOrientation);
});
```

**结果**：竖着拿手机时输出 `portrait`。

## 对应的 iOS API

`UIWindowScene.effectiveGeometry`。iOS 26 起原来的 `UIWindowScene.interfaceOrientation` 废弃，方向在这里读。

## 参见

- [`UIWindowSceneGeometry`](../ui-window-scene-geometry.md)
- [`geometrychange`](geometrychange-event.md)
