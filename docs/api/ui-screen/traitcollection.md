---
type: reference
native: UIScreen.traitCollection
---

# `UIScreen`：`traitCollection` 属性

**`traitCollection`** 属性是这块屏幕的外观特征：深色还是浅色、几倍屏等。

## 值

[`UITraitCollection`](../ui-trait-collection.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读给当时的那一份。
- 它的 `displayScale` 和 [`scale`](scale.md) 相同。
- 屏幕上没有外观特征的变化事件。要在深色、浅色切换时收到通知，监听场景的 [`traitchange`](../ui-window-scene/traitchange-event.md)。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const screen = e.scene.screen;
  console.log(screen.traitCollection.displayScale);
});
```

**结果**：在 iPhone Air 模拟器（iOS 27.2）上输出 `3`。

## 对应的 iOS API

`UIScreen.traitCollection`（`UITraitEnvironment` 协议）。

## 参见

- [外观特征](../ui-trait-collection.md)
- [`UIWindowScene` 的 `traitCollection`](../ui-window-scene/traitcollection.md)
