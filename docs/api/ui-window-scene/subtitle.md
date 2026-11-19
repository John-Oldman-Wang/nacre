---
type: reference
native: UIScene.subtitle
---

# `UIWindowScene`：`subtitle` 属性

**`subtitle`** 属性是多任务切换器的卡片上显示的副标题。

## 值

字符串。

- 可读，可写。
- 默认值**未在模拟器验证**。
- 写入的值不是字符串时，设为空字符串。
- 卡片上显示成什么样**未在模拟器验证**。
- 变化时不派发事件：只有 App 的代码会改它。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.subtitle = '3 封未读';
  console.log(e.scene.subtitle);
});
```

**结果**：输出 `3 封未读`。

## 对应的 iOS API

`UIScene.subtitle`。

## 参见

- [`title`](title.md)
