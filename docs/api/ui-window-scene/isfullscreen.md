---
type: reference
native: UIWindowScene.fullScreen
---

# `UIWindowScene`：`isFullScreen` 属性

**`isFullScreen`** 属性表示场景是否占满整个屏幕。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 场景占满整个屏幕 |
| `false` | 没有占满 |

- 只读。给它赋值抛 `TypeError`。
- 由系统决定。iPhone 上读到的值**未在模拟器验证**。
- 没有变化通知：对应的原生事件还没有提供。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.isFullScreen);
});
```

**结果**：输出这个场景是否占满屏幕。**未在模拟器验证。**

## 对应的 iOS API

`UIWindowScene.fullScreen`。JS 里叫 `isFullScreen`。

## 参见

- [`UIWindowScene`](../ui-window-scene.md)
