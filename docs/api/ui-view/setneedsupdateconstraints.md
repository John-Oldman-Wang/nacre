---
type: reference
native: "-[UIView setNeedsUpdateConstraints]"
---

# `UIView`：`setNeedsUpdateConstraints()` 方法

**`setNeedsUpdateConstraints()`** 方法标记这个视图的约束需要更新。系统在下一次布局之前更新。

## 语法

```
setNeedsUpdateConstraints()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

效果**未在模拟器验证**。

## 示例

```js
const view = new UIView();
view.setNeedsUpdateConstraints();
```

**效果**：没有可见的变化。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView setNeedsUpdateConstraints]`。

## 参见

- [`updateConstraintsIfNeeded()`](updateconstraintsifneeded.md)、[`needsUpdateConstraints()`](needsupdateconstraints.md)
