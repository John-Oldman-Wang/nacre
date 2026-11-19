---
type: reference
native: "-[UIWindowScene registerForTraitChanges:withHandler:]"
---

# `UIWindowScene`：`traitchange` 事件

**`traitchange`** 事件在整个场景的外观特征变化时派发，比如系统切到深色模式。

## 语法

```
scene.addEventListener('traitchange', (event) => { })
```

## 事件对象

`UITraitChangeEvent`。除了 `type` 和 `target`（这个场景），多一个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `previousTraitCollection` | [`UITraitCollection`](../ui-trait-collection.md) | 变化之前的那一组值。现在的值从 `event.target.traitCollection` 读 |

不能取消。

## 什么时候派发

场景的 [`traitCollection`](traitcollection.md) 里有值变了时派发。哪些变化会派发、要注意的地方，见[外观特征](../ui-trait-collection.md)。

## 示例

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  scene.addEventListener('traitchange', (ev) => {
    const { previousTraitCollection } = /** @type {UITraitChangeEvent} */ (ev);
    console.log(previousTraitCollection.userInterfaceStyle, '→',
      scene.traitCollection.userInterfaceStyle);
  });
});
```

**效果**：用户在系统设置里从浅色切到深色，输出 `light → dark`。**未在模拟器验证。**

## 对应的 iOS API

`UITraitEnvironment` 的 `traitCollectionDidChange:`，以及 iOS 17 起的 `registerForTraitChanges:`。

## 参见

- [外观特征](../ui-trait-collection.md)
