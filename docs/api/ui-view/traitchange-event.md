---
type: reference
native: "-[UIView registerForTraitChanges:withHandler:]"
---

# `UIView`：`traitchange` 事件

**`traitchange`** 事件在视图的外观特征（深浅色、屏幕倍数、文字大小等）变化时派发。

`UIViewController`、`UIWindowScene` 上也有同名事件。`UIView` 的子类（[`UIButton`](../ui-button.md)、[`UIScrollView`](../ui-scroll-view.md) 等）都能监听。

## 语法

```
view.addEventListener('traitchange', (event) => { })
```

## 事件对象

[`UITraitChangeEvent`](../ui-trait-change-event.md)。除了 `type`、`target`，多一个字段：

**[`previousTraitCollection`](../ui-trait-change-event/previoustraitcollection.md)**

[`UITraitCollection`](../ui-trait-collection.md)：变化之前的那组值。现在的值不在事件对象上，从 `event.target.traitCollection` 读，回调执行时它已经是新值。

事件不能取消。

## 什么时候派发

- 这个视图的外观特征里，`UITraitCollection` 的七项中有任何一项变了时派发。
- 系统切换深浅色时派发；写 [`overrideUserInterfaceStyle`](overrideuserinterfacestyle.md) 让这个视图的外观变了时也派发；用户改了系统的文字大小时也派发。三种都在模拟器上核对过。
- 其余四项（两个 size class、对比度、书写方向）变化时是否派发，**未在模拟器验证**。
- 一次变化派发一次。只有外观特征真的变了才派发；把 `overrideUserInterfaceStyle` 写成和当前实际外观相同的值时是否派发，**未在模拟器验证**。
- 回调不是在变化的那一刻同步执行，而是稍后执行，见[运行时怎么工作](../how-it-works.md)。
- 事件派发在被监听的那个视图上，不沿着视图树传递。一个视图的外观变了，它的子视图读到的值跟着变（已验证）；在子视图上监听能收到它自己的那一次，**未在模拟器验证**。

`UIView` 自己派发的事件只有这一个。触摸不产生 `UIView` 的事件，要响应触摸，用[手势识别器](../ui-gesture-recognizer.md)或 [`UIControl`](../ui-control.md) 的子类。

## 示例

```js
const page = new UIViewController();
page.view.addEventListener('traitchange', (event) => {
  console.log(event.previousTraitCollection.userInterfaceStyle);
  console.log(page.view.traitCollection.userInterfaceStyle);
});
```

**效果**：从浅色变成深色时，依次输出 `light` 和 `dark`。

## 对应的 iOS API

`-[UIView registerForTraitChanges:withHandler:]`，以及旧的 `traitCollectionDidChange:`。这里写成 `addEventListener('traitchange', …)`。

## 参见

- [外观特征](../ui-trait-collection.md)
- [`traitCollection`](traitcollection.md)
