---
type: reference
native: "-[UIView setNeedsDisplayInRect:]"
---

# `UIView`：`setNeedsDisplayInRect()` 方法

**`setNeedsDisplayInRect()`** 方法标记视图里的一块矩形需要重新绘制。

## 语法

```
setNeedsDisplayInRect(rect)
```

### 参数

**`rect`**

[`CGRect`](../cg-rect.md) 或 `{ x, y, width, height }`，在视图自己的坐标系里，单位 [pt](../units.md)。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`rect` 不是对象或缺字段，规则和[结构体](../structs.md#写入时可以给普通对象)相同，报错以 `setNeedsDisplayInRect` 开头。

## 说明

这个方法是后补的，没有在模拟器上调过，效果**未在模拟器验证**。

## 示例

```js
const view = new UIView();
view.setNeedsDisplayInRect(new CGRect(0, 0, 50, 50));
```

**效果**：没有可见的变化。自己绘制视图内容（`drawRect:`）还不能做，所以这个方法目前很少用到。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView setNeedsDisplayInRect:]`。

## 参见

- [`setNeedsDisplay()`](setneedsdisplay.md)
