---
type: reference
native: UINavigationController.toolbar
---

# `UINavigationController`：`toolbar` 属性

**`toolbar`** 属性是导航控制器自己管的那条底部工具条，一个 [`UIToolbar`](../ui-toolbar.md)。

## 值

[`UIToolbar`](../ui-toolbar.md)，总是有值。

- 只读。给它赋值抛 `TypeError`。
- 每次读到的是同一个对象。
- 工具条默认藏着，要显示用 [`isToolbarHidden`](istoolbarhidden.md) 或 [`setToolbarHidden()`](settoolbarhidden.md)。

> **注意**：Apple 规定这条工具条由导航控制器管理，不要直接改它的 `items`。往上面放按钮，iOS 用的是每个页面自己的 `toolbarItems`，Nacre 还没有提供，见[还不能做的](../ui-navigation-controller.md#还不能做的)。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
console.log(nav.toolbar instanceof UIToolbar);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UINavigationController.toolbar`。

## 参见

- [`isToolbarHidden`](istoolbarhidden.md)
- [`UIToolbar`](../ui-toolbar.md)
