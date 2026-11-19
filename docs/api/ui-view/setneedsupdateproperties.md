---
type: reference
native: "-[UIView setNeedsUpdateProperties]"
---

# `UIView`：`setNeedsUpdateProperties()` 方法

**`setNeedsUpdateProperties()`** 方法标记这个视图需要更新属性。系统在下一次更新时调用视图的属性更新过程。

## 语法

```
setNeedsUpdateProperties()
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
view.setNeedsUpdateProperties();
```

**效果**：没有可见的变化。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView setNeedsUpdateProperties]`。

## 参见

- [`updatePropertiesIfNeeded()`](updatepropertiesifneeded.md)
