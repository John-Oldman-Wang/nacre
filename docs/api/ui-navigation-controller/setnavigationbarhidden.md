---
type: reference
native: "-[UINavigationController setNavigationBarHidden:animated:]"
---

# `UINavigationController`：`setNavigationBarHidden()` 方法

**`setNavigationBarHidden()`** 方法藏起或显示导航条，可以带动画。

## 语法

```
setNavigationBarHidden(hidden)
setNavigationBarHidden(hidden, { animated })
```

### 参数

**`hidden`**

布尔值。`true` 藏起，`false` 显示。

**`options.animated`**

布尔值，可选。`true` 带动画，`false` 或不写时没有动画。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
const nav = new UINavigationController(new UIViewController());
nav.setNavigationBarHidden(true, { animated: true });
console.log(nav.isNavigationBarHidden);
```

**效果**：导航条带着动画消失。控制台输出 `true`。**动画未在模拟器验证。**

## 对应的 iOS API

`-[UINavigationController setNavigationBarHidden:animated:]`。

## 参见

- [`isNavigationBarHidden`](isnavigationbarhidden.md)
- [`beforeshow`](beforeshow-event.md)：按即将显示的页面决定藏不藏
