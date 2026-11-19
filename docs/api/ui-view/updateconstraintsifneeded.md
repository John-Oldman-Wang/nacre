---
type: reference
native: "-[UIView updateConstraintsIfNeeded]"
---

# `UIView`：`updateConstraintsIfNeeded()` 方法

**`updateConstraintsIfNeeded()`** 方法在有待处理的约束更新时立刻完成它，包括后代。

## 语法

```
updateConstraintsIfNeeded()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

这个方法是后补的，没有在模拟器上调过，效果**未在模拟器验证**。

更新约束的那一步在 ObjC 里是覆写 `updateConstraints`，这里不能覆写，所以这个方法目前只是触发系统自己的更新，见[还不能做的](../ui-view.md#还不能做的)。

## 示例

```js
const view = new UIView();
view.updateConstraintsIfNeeded();
```

**效果**：没有可见的变化。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView updateConstraintsIfNeeded]`。

## 参见

- [`setNeedsUpdateConstraints()`](setneedsupdateconstraints.md)、[`needsUpdateConstraints()`](needsupdateconstraints.md)
