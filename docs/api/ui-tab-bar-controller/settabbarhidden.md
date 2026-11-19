---
type: reference
native: "-[UITabBarController setTabBarHidden:animated:]"
---

# `UITabBarController`：`setTabBarHidden()` 方法

**`setTabBarHidden()`** 方法藏起或显示标签栏，可以带动画。

## 语法

```
setTabBarHidden(hidden)
setTabBarHidden(hidden, { animated })
```

### 参数

**`hidden`**

布尔值。`true` 藏起，`false` 显示。

**`options.animated`**

布尔值，可选，默认 `false`。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
const tabs = new UITabBarController();
tabs.setTabBarHidden(true, { animated: true });
console.log(tabs.isTabBarHidden);
```

**效果**：标签栏带着动画消失，控制台输出 `true`。再调一次并传 `false` 就回来。**动画未在模拟器验证。**

## 对应的 iOS API

`-[UITabBarController setTabBarHidden:animated:]`。

## 参见

- [`isTabBarHidden`](istabbarhidden.md)
