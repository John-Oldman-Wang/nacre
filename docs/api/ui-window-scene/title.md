---
type: reference
native: UIScene.title
---

# `UIWindowScene`：`title` 属性

**`title`** 属性是多任务切换器的卡片上显示的标题。多任务切换器是用户从屏幕底部上滑后看到的界面，每个 App 显示为一张卡片。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值**未在模拟器验证**。
- 写 `null` 清除。
- 卡片上显示成什么样**未在模拟器验证**。
- 变化时不派发事件：只有 App 的代码会改它。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  e.scene.title = '收件箱';
  console.log(e.scene.title);
});
```

**结果**：输出 `收件箱`。

## 对应的 iOS API

`UIScene.title`。

## 参见

- [`subtitle`](subtitle.md)
