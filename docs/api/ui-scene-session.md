---
type: reference
native: UISceneSession
status: partial
---

# `UISceneSession`

**`UISceneSession`** 表示场景的会话：场景的持久身份。场景对象可能被系统销毁后重新创建，会话存在的时间比场景对象长。用它判断「这是一个新的场景」还是「之前的场景又接入了」，也用它存这个场景自己的数据。

会话从场景的 [`session`](ui-window-scene/session.md) 读到。

**继承关系**：`EventTarget` → `NSObject` → `UISceneSession`

## 构造函数

不能用 `new` 创建。`new UISceneSession()` 抛 `TypeError: Illegal constructor: UISceneSession is created by the runtime, not by new`。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`role`](ui-scene-session/role.md) <small>只读</small> | 场景的用途 |
| [`persistentIdentifier`](ui-scene-session/persistentidentifier.md) <small>只读</small> | 这个会话的唯一标识 |
| [`userInfo`](ui-scene-session/userinfo.md) | App 自己的数据，系统负责保存 |

这些属性变了都没有事件：前两个不会变，`userInfo` 只有 App 的代码会改。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const session = e.scene.session;
  console.log(session.role);
  console.log(typeof session.persistentIdentifier);
});
```

**结果**：依次输出 `UIWindowSceneSessionRoleApplication` 和 `string`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `scene.session.persistentIdentifier` | `scene.session.persistentIdentifier` |
| `scene.session.userInfo = @{ @"kind": @"mailDetail" }` | `scene.session.userInfo = { kind: 'mailDetail' }` |

## 参见

- [`UIWindowScene`](ui-window-scene.md)
- [建窗口和处理场景](../guides/scenes-and-windows.md#记住这个场景上次在看什么)
