---
type: reference
native: "-[UIView setNeedsDisplay]"
---

# `UIView`：`setNeedsDisplay()` 方法

**`setNeedsDisplay()`** 方法标记这个视图需要重新绘制。

## 语法

```
setNeedsDisplay()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
const view = new UIView();
view.setNeedsDisplay();
```

**效果**：视图在下一次绘制时重画内容。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView setNeedsDisplay]`。

## 参见

- [`setNeedsDisplayInRect()`](setneedsdisplayinrect.md)：只重画一块
