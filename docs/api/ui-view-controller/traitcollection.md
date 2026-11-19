---
type: reference
native: UIViewController.traitCollection
---

# `UIViewController`：`traitCollection` 属性

**`traitCollection`** 属性是这个页面所处环境的外观特征：深色还是浅色、屏幕几倍、文字多大。

## 值

[`UITraitCollection`](../ui-trait-collection.md)。

- 只读。给它赋值抛 `TypeError`。
- 外观特征变了派发 [`traitchange`](traitchange-event.md) 事件。
- 各项取值和要注意的地方见[外观特征](../ui-trait-collection.md)。

## 示例

```js
const page = new UIViewController();
console.log(page.traitCollection.userInterfaceStyle);
```

**结果**：输出当前是浅色还是深色，比如 `light`。页面还没显示时读到的值**未在模拟器验证**。

## 对应的 iOS API

`UIViewController.traitCollection`。

## 参见

- [`overrideUserInterfaceStyle`](overrideuserinterfacestyle.md)
- [`traitchange`](traitchange-event.md)
