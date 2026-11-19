---
type: reference
native: UISceneSession.role
---

# `UISceneSession`：`role` 属性

**`role`** 属性是场景的用途。

## 值

字符串，值是原生常量的原文。普通的 App 界面是 `'UIWindowSceneSessionRoleApplication'`。

- 只读。给它赋值抛 `TypeError`。
- 不会变，所以没有变化通知。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.session.role === 'UIWindowSceneSessionRoleApplication');
});
```

**结果**：输出 `true`。

## 对应的 iOS API

`UISceneSession.role`。常量不去前缀，写成原文。

## 参见

- [`UISceneSession`](../ui-scene-session.md)
