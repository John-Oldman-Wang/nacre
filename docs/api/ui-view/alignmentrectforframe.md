---
type: reference
native: "-[UIView alignmentRectForFrame:]"
---

# `UIView`：`alignmentRectForFrame()` 方法

**`alignmentRectForFrame()`** 方法把一个 `frame` 换算成对应的对齐矩形。对齐矩形是约束对齐时用的矩形，比 `frame` 往里缩 [`alignmentRectInsets`](alignmentrectinsets.md)。

## 语法

```
alignmentRectForFrame(frame)
```

### 参数

**`frame`**

[`CGRect`](../cg-rect.md) 或 `{ x, y, width, height }`，单位 [pt](../units.md)。

### 返回值

换算出的对齐矩形，`CGRect`。

### 异常

**`TypeError`**

参数不是对象或缺字段，规则和[结构体](../structs.md#写入时可以给普通对象)相同，报错以 `alignmentRectForFrame` 开头。

## 说明

这个方法是后补的，没有在模拟器上调过，效果**未在模拟器验证**。

## 示例

```js
const view = new UIView();
const r = view.alignmentRectForFrame(new CGRect(10, 20, 100, 50));
console.log(String(r));
```

**结果**：普通视图的 `alignmentRectInsets` 是 0，输出 `CGRect(10, 20, 100, 50)`。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView alignmentRectForFrame:]`。

## 参见

- [`alignmentRectInsets`](alignmentrectinsets.md)
- [`frameForAlignmentRect()`](frameforalignmentrect.md)
