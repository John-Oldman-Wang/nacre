---
type: reference
native: UILabel.baselineAdjustment
---

# `UILabel`：`baselineAdjustment` 属性

**`baselineAdjustment`** 属性决定字号自动缩小之后，文字在垂直方向上怎么摆放。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'alignBaselines'` | 缩小后的文字，基线保持在原字号时基线的位置。基线是一行文字里字母底部对齐的那条线 |
| `'alignCenters'` | 缩小后的文字在标签内垂直居中 |
| `'none'` | 缩小后的文字贴着标签的顶部 |

- 可读，可写。
- 默认值是 `'alignBaselines'`。
- 只在 [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md) 是 `true` 时起作用。

默认值和效果都**未在模拟器验证**。

### 写错时

写入表外的值时不抛异常：属性保持原来的值，控制台输出一条警告：

```
[Nacre] baselineAdjustment has no value "middle"; expected one of: …, ignored
```

## 示例

```js
const label = new UILabel();
label.adjustsFontSizeToFitWidth = true;
label.baselineAdjustment = 'alignCenters';
```

**效果**：字号缩小之后，文字在标签内垂直居中。**未在模拟器验证。**

## 对应的 iOS API

`UILabel.baselineAdjustment`。`UIBaselineAdjustmentAlignCenters` 写成 `'alignCenters'`，其余同理。

## 参见

- [`adjustsFontSizeToFitWidth`](adjustsfontsizetofitwidth.md)
