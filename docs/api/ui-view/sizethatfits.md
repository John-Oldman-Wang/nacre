---
type: reference
native: "-[UIView sizeThatFits:]"
---

# `UIView`：`sizeThatFits()` 方法

**`sizeThatFits()`** 方法询问视图：在不超过 `size` 的前提下，显示全部内容需要多大。它不改变视图。

## 语法

```
sizeThatFits(size)
```

### 参数

**`size`**

[`CGSize`](../cg-size.md) 或 `{ width, height }`，可用的最大空间，单位 [pt](../units.md)。

### 返回值

`CGSize`，单位 pt。同步返回，不是 Promise。

### 异常

**`TypeError`**

- `size` 不是对象：`sizeThatFits needs an object with all of: width, height`。
- `size` 缺字段：`sizeThatFits is missing width, or it is not a finite number`。

## 说明

它问的是视图自己的内容：文字、按钮这类视图知道自己的内容需要多大。要按子视图之间的约束算大小，用 [`systemLayoutSizeFittingSize()`](systemlayoutsizefittingsize.md)。

## 示例

```js
const label = new UILabel();
label.text = 'Hello, Nacre';

const need = label.sizeThatFits(new CGSize(300, 1000));
label.frame = new CGRect(40, 500, need.width, need.height);
```

**效果**：视图的大小刚好等于文字的大小。

## 对应的 iOS API

`-[UIView sizeThatFits:]`。

## 参见

- [`sizeToFit()`](sizetofit.md)：量出大小并改成这个大小
- [`systemLayoutSizeFittingSize()`](systemlayoutsizefittingsize.md)：按约束算大小
