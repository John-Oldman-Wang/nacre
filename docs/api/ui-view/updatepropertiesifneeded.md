---
type: reference
native: "-[UIView updatePropertiesIfNeeded]"
---

# `UIView`：`updatePropertiesIfNeeded()` 方法

**`updatePropertiesIfNeeded()`** 方法在有待处理的属性更新时立刻完成它。

## 语法

```
updatePropertiesIfNeeded()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

这个方法是后补的，没有在模拟器上调过，效果**未在模拟器验证**。

属性更新的那一步在 ObjC 里是覆写 `updateProperties`，这里不能覆写，所以这个方法目前只是触发系统自己的更新。

## 示例

```js
const view = new UIView();
view.updatePropertiesIfNeeded();
```

**效果**：没有可见的变化。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView updatePropertiesIfNeeded]`。

## 参见

- [`setNeedsUpdateProperties()`](setneedsupdateproperties.md)
