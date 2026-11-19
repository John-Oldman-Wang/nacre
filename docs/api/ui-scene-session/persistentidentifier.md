---
type: reference
native: UISceneSession.persistentIdentifier
---

# `UISceneSession`：`persistentIdentifier` 属性

**`persistentIdentifier`** 属性是这个会话的唯一标识。

## 值

字符串。

- 只读。给它赋值抛 `TypeError`。
- 由系统决定，不会变，所以没有变化通知。
- 场景被销毁重建后保持不变。**未在模拟器验证。**

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log('接入:', e.scene.session.persistentIdentifier);
});
application.addEventListener('scenedisconnect', (e) => {
  console.log('断开:', e.scene.session.persistentIdentifier);
});
```

**效果**：场景接入时输出一行 `接入: …`。`scenedisconnect` 的派发**未在模拟器验证**。

## 对应的 iOS API

`UISceneSession.persistentIdentifier`。

## 参见

- [`userInfo`](userinfo.md)
