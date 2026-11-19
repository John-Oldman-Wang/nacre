---
type: reference
native: UIWindowScene.traitCollection
---

# `UIWindowScene`：`traitCollection` 属性

**`traitCollection`** 属性是整个场景的外观特征。系统设置里现在是深色还是浅色，读它的 `userInterfaceStyle`。

## 值

[`UITraitCollection`](../ui-trait-collection.md)。

- 只读。给它赋值抛 `TypeError`。
- 变了会派发 [`traitchange`](traitchange-event.md) 事件。
- 各项取值见[外观特征](../ui-trait-collection.md)。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  console.log(e.scene.traitCollection.userInterfaceStyle);
});
```

**结果**：输出系统当前是浅色还是深色，比如 `light`。

## 对应的 iOS API

`UIWindowScene.traitCollection`。

## 参见

- [外观特征](../ui-trait-collection.md)
