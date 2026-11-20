---
type: reference
native: UIWindowSceneGeometryPreferencesIOS
---

# `UIWindowSceneGeometryPreferencesIOS`

**`UIWindowSceneGeometryPreferencesIOS`** 表示请求转屏时的偏好：想要哪几个方向。把它交给场景的 [`requestGeometryUpdateWithPreferences()`](ui-window-scene/requestgeometryupdatewithpreferences.md)。

**继承关系**：`EventTarget` → `NSObject` → `UIWindowSceneGeometryPreferencesIOS`

## 构造函数

[`UIWindowSceneGeometryPreferencesIOS()`](ui-window-scene-geometry-preferences-ios/constructor.md)

用一组方向名建偏好。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`interfaceOrientations`](ui-window-scene-geometry-preferences-ios/interfaceorientations.md) | 想要的方向 |

## 示例

```js
const prefs = new UIWindowSceneGeometryPreferencesIOS(['landscapeRight']);
console.log(prefs.interfaceOrientations.join(','));
```

**结果**：输出 `landscapeRight`。

## 对应的 iOS API

`UIWindowSceneGeometryPreferencesIOS`。

## 参见

- [`requestGeometryUpdateWithPreferences()`](ui-window-scene/requestgeometryupdatewithpreferences.md)
