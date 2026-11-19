---
type: reference
native: "-[UIView frameForAlignmentRect:]"
---

# `UIView`：`frameForAlignmentRect()` 方法

**`frameForAlignmentRect()`** 方法把一个对齐矩形换算成对应的 `frame`。对齐矩形是约束对齐时用的矩形，比 `frame` 往里缩 [`alignmentRectInsets`](alignmentrectinsets.md)。

## 语法

```
frameForAlignmentRect(alignmentRect)
```

### 参数

**`alignmentRect`**

[`CGRect`](../cg-rect.md) 或 `{ x, y, width, height }`，单位 [pt](../units.md)。

### 返回值

换算出的`frame`，`CGRect`。

### 异常

**`TypeError`**

参数不是对象或缺字段，规则和[结构体](../structs.md#写入时可以给普通对象)相同，报错以 `frameForAlignmentRect` 开头。

## 说明

这个方法是后补的，没有在模拟器上调过，效果**未在模拟器验证**。

## 示例

```js
const view = new UIView();
const r = view.frameForAlignmentRect(new CGRect(10, 20, 100, 50));
console.log(String(r));
```

**结果**：普通视图的 `alignmentRectInsets` 是 0，输出 `CGRect(10, 20, 100, 50)`。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView frameForAlignmentRect:]`。

## 参见

- [`alignmentRectInsets`](alignmentrectinsets.md)
- [`alignmentRectForFrame()`](alignmentrectforframe.md)
