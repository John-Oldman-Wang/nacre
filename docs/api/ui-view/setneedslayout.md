---
type: reference
native: "-[UIView setNeedsLayout]"
---

# `UIView`：`setNeedsLayout()` 方法

**`setNeedsLayout()`** 方法标记这个视图需要重新布局。布局在稍后进行，不是立刻。

## 语法

```
setNeedsLayout()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

系统不会在每次属性变化后立刻重新布局，而是做一个标记，稍后统一处理。日常只会用到 [`layoutIfNeeded()`](layoutifneeded.md)。

## 示例

```js
const stack = new UIStackView([new UIView()]);
stack.frame = new CGRect(0, 0, 200, 100);
stack.layoutIfNeeded();
stack.isLayoutMarginsRelativeArrangement = true;
stack.setNeedsLayout();
stack.layoutIfNeeded();
```

**效果**：排列项按内边距缩进。容器不在窗口里、又已经布局过一次时，改了内边距的开关要先 `setNeedsLayout()` 再 `layoutIfNeeded()`，排列项的位置才更新（实测）。

## 对应的 iOS API

`-[UIView setNeedsLayout]`。

## 参见

- [`layoutIfNeeded()`](layoutifneeded.md)
