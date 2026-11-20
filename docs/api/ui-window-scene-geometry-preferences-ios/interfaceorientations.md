---
type: reference
native: UIWindowSceneGeometryPreferencesIOS.interfaceOrientations
---

# `UIWindowSceneGeometryPreferencesIOS`：`interfaceOrientations` 属性

**`interfaceOrientations`** 属性是这份偏好想要的方向。

## 值

方向名的数组。

- 可读，可写。读出来是单个方向的名字，合称会拆开。
- 写入时有不认识的名字：整次不生效，打一条警告。写的不是数组，抛 `TypeError`。

## 示例

```js
const prefs = new UIWindowSceneGeometryPreferencesIOS();
prefs.interfaceOrientations = ['portrait', 'landscapeLeft'];
console.log(prefs.interfaceOrientations.join(','));
```

**结果**：输出 `portrait,landscapeLeft`。

## 对应的 iOS API

`UIWindowSceneGeometryPreferencesIOS.interfaceOrientations`。
