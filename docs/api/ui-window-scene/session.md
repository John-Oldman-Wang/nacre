---
type: reference
native: UIScene.session
---

# `UIWindowScene`：`session` 属性

**`session`** 属性是这个场景的会话 [`UISceneSession`](../ui-scene-session.md)：场景的持久身份。

## 值

[`UISceneSession`](../ui-scene-session.md)。

- 只读。给它赋值抛 `TypeError`。
- 由系统决定。同一个场景每次读到的是同一个对象。
- 场景被系统销毁、再创建新的场景对象时，新场景的 `session` 表示同一份界面：`persistentIdentifier` 相同，`userInfo` 里存的数据还在。**未在模拟器验证。**

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const session = e.scene.session;
  console.log(session === e.scene.session);
  console.log(session.role);
});
```

**结果**：依次输出 `true` 和 `UIWindowSceneSessionRoleApplication`。

## 对应的 iOS API

`UIScene.session`。

## 参见

- [`UISceneSession`](../ui-scene-session.md)
