---
type: reference
native: "-[UIView updateTraitsIfNeeded]"
---

# `UIView`：`updateTraitsIfNeeded()` 方法

**`updateTraitsIfNeeded()`** 方法在有待处理的外观特征更新时立刻完成它。

## 语法

```
updateTraitsIfNeeded()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

这个方法是后补的，没有在模拟器上调过，效果**未在模拟器验证**。

## 示例

```js
const view = new UIView();
view.updateTraitsIfNeeded();
```

**效果**：没有可见的变化。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView updateTraitsIfNeeded]`。

## 参见

- [`traitCollection`](traitcollection.md)
