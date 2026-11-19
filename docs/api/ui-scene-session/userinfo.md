---
type: reference
native: UISceneSession.userInfo
---

# `UISceneSession`：`userInfo` 属性

**`userInfo`** 属性存放 App 自己的数据，系统负责保存。

## 值

普通对象，或者 `null`。

- 可读，可写。
- 默认值**未在模拟器验证**。
- 写 `null` 或者不是普通对象的值时清除。
- 值只能是字符串、数字、布尔、数组和普通对象。值里带 `null` 时系统怎么处理，**未在模拟器验证**。
- 写入之后在同一次运行里读，读到写入的内容。
- 场景断开再接入、App 被终止后重新打开，是否还在，**未在模拟器验证**。
- 变化时不派发事件：只有 App 的代码会改它。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const session = e.scene.session;
  const info = session.userInfo;
  if (info && info.kind === 'mailDetail') {
    console.log('上次在看邮件', info.mailId);
  } else {
    console.log('没有记录，显示首页');
  }
  session.userInfo = { kind: 'mailDetail', mailId: 42 };
});
```

**效果**：第一次运行输出 `没有记录，显示首页`。写入之后在同一次运行里读 `session.userInfo`，读到写入的内容。

## 对应的 iOS API

`UISceneSession.userInfo`。

## 参见

- [建窗口和处理场景](../../guides/scenes-and-windows.md#数据放在哪里)
