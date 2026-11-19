---
type: reference
native: "-[UIViewController traitCollectionDidChange:]"
---

# `UIViewController`：`traitchange` 事件

**`traitchange`** 事件在页面的外观特征变化时派发，比如切到深色模式、改了文字大小。

## 语法

```
page.addEventListener('traitchange', (event) => { })
```

## 事件对象

`UITraitChangeEvent`。除了 `type` 和 `target`（这个页面），多一个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `previousTraitCollection` | [`UITraitCollection`](../ui-trait-collection.md) | 变化之前的那一组值。现在的值从 `event.target.traitCollection` 读 |

不能取消。

## 什么时候派发

页面的 [`traitCollection`](traitcollection.md) 里有值变了时派发，包括改了 [`overrideUserInterfaceStyle`](overrideuserinterfacestyle.md)。哪些变化会派发、要注意的地方，见[外观特征](../ui-trait-collection.md)。

## 示例

```js
const page = new UIViewController();
page.addEventListener('traitchange', (event) => {
  const { previousTraitCollection } = /** @type {UITraitChangeEvent} */ (event);
  console.log(previousTraitCollection.userInterfaceStyle, '→',
    page.traitCollection.userInterfaceStyle);
});
page.overrideUserInterfaceStyle = 'dark';
```

**效果**：页面在屏幕上、原来是浅色时，输出 `light → dark`。**未在模拟器验证。**

## 对应的 iOS API

`-[UIViewController traitCollectionDidChange:]`，以及 iOS 17 起的 `registerForTraitChanges:`。

## 参见

- [外观特征](../ui-trait-collection.md)
