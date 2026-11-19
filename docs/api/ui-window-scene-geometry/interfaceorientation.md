---
type: reference
native: UIWindowSceneGeometry.interfaceOrientation
---

# `UIWindowSceneGeometry`：`interfaceOrientation` 属性

**`interfaceOrientation`** 属性是界面的方向。

## 值

字符串：`'portrait'`、`'portraitUpsideDown'`、`'landscapeLeft'`、`'landscapeRight'`，拿不到时是 `'unknown'`。

- 只读。
- 是界面实际显示的方向，不是手机物理上怎么拿着：界面锁了竖屏时，手机横过来它还是 `'portrait'`。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.effectiveGeometry.interfaceOrientation);
});
```

**结果**：竖着拿手机时输出 `portrait`。

## 对应的 iOS API

`UIWindowSceneGeometry.interfaceOrientation`。
