---
type: reference
native: UIView.traitCollection
---

# `UIView`：`traitCollection` 属性

**`traitCollection`** 属性是这个视图所处环境的外观特征：深色还是浅色、屏幕几倍、文字多大。

## 值

[`UITraitCollection`](../ui-trait-collection.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读得到的是当时的值，不会自己跟着变。
- 外观特征变了会派发 [`traitchange`](traitchange-event.md) 事件。

## 示例

```js
const view = new UIView();
if (view.traitCollection.userInterfaceStyle === 'dark') {
  console.log('现在是深色');
}
```

**结果**：系统是深色模式时输出 `现在是深色`。

## 对应的 iOS API

`UIView.traitCollection`。

## 参见

- [外观特征](../ui-trait-collection.md)
- [`overrideUserInterfaceStyle`](overrideuserinterfacestyle.md)
- [`traitchange`](traitchange-event.md)
