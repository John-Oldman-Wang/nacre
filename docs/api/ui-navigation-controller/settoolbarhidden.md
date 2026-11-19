---
type: reference
native: "-[UINavigationController setToolbarHidden:animated:]"
---

# `UINavigationController`：`setToolbarHidden()` 方法

**`setToolbarHidden()`** 方法藏起或显示屏幕底部的工具条，可以带动画。

## 语法

```
setToolbarHidden(hidden)
setToolbarHidden(hidden, { animated })
```

### 参数

**`hidden`**

布尔值。`true` 藏起，`false` 显示。

**`options.animated`**

布尔值，可选。`true` 带动画，`false` 或不写时没有动画。整个 options 传 `null` 当成没写。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
nav.setToolbarHidden(false, { animated: true });
console.log(nav.isToolbarHidden);
```

**效果**：工具条带着动画从底部出现。控制台输出 `false`。**动画未在模拟器验证。**

## 对应的 iOS API

`-[UINavigationController setToolbarHidden:animated:]`。

## 参见

- [`isToolbarHidden`](istoolbarhidden.md)
- [`toolbar`](toolbar.md)
