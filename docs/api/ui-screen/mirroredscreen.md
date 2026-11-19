---
type: reference
native: UIScreen.mirroredScreen
---

# `UIScreen`：`mirroredScreen` 属性

**`mirroredScreen`** 属性是这块屏幕正在镜像的那块屏幕。

## 值

[`UIScreen`](../ui-screen.md) 或 `null`。

- 只读。给它赋值抛 `TypeError`。
- 没有在镜像别的屏幕时是 `null`。手机自己的屏幕读到 `null`。
- 外接显示器镜像手机屏幕时，外接显示器那块屏幕的 `mirroredScreen` 是手机的屏幕。这种情况**未在模拟器验证**。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.mirroredScreen);
});
```

**结果**：输出 `null`。

## 对应的 iOS API

`UIScreen.mirroredScreen`。

## 参见

- [`UIScreen`](../ui-screen.md)
