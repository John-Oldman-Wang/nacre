---
type: reference
native: "-[UIWindowSceneGeometryPreferencesIOS initWithInterfaceOrientations:]"
---

# `UIWindowSceneGeometryPreferencesIOS()` 构造函数

**`UIWindowSceneGeometryPreferencesIOS()`** 构造函数用一组方向名建一份转屏的偏好。

## 语法

```
new UIWindowSceneGeometryPreferencesIOS()
new UIWindowSceneGeometryPreferencesIOS(interfaceOrientations)
```

## 参数

**`interfaceOrientations`**

方向名的数组，可以不传。不传是「没有偏好」，交给 `requestGeometryUpdateWithPreferences()` 时会抛。

| 名字 | 方向 |
| --- | --- |
| `'portrait'` | 竖着，底部横条在下 |
| `'portraitUpsideDown'` | 倒竖着 |
| `'landscapeLeft'` | 横着，手机的顶部朝右 |
| `'landscapeRight'` | 横着，手机的顶部朝左 |
| `'landscape'` | 两种横屏的合称 |
| `'all'` | 四个方向的合称 |
| `'allButUpsideDown'` | 除了倒竖的三个方向 |

## 返回值

一份新的偏好。

## 异常

**`TypeError`**

- 数组里有不认识的名字：`interfaceOrientations has no value "sideways"; expected one of: …`。
- 传的不是数组：`interfaceOrientations needs an array of orientation names`。

## 示例

```js
const prefs = new UIWindowSceneGeometryPreferencesIOS(['landscape']);
console.log(prefs.interfaceOrientations.join(','));
```

**结果**：输出 `landscapeLeft,landscapeRight`。

## 对应的 iOS API

`-[UIWindowSceneGeometryPreferencesIOS initWithInterfaceOrientations:]`。

## 参见

- [`UIWindowSceneGeometryPreferencesIOS`](../ui-window-scene-geometry-preferences-ios.md)
