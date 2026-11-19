---
type: reference
native: "-[UIView exchangeSubviewAtIndex:withSubviewAtIndex:]"
---

# `UIView`：`exchangeSubviewAtIndex()` 方法

**`exchangeSubviewAtIndex()`** 方法交换两个子视图在 [`subviews`](subviews.md) 里的位置，也就是交换它们的叠放顺序。

## 语法

```
exchangeSubviewAtIndex(index1, { withSubviewAtIndex })
```

### 参数

**`index1`**

一个子视图的序号，从 0 开始的整数。按整数转换，小数向零取整。

**`options.withSubviewAtIndex`**

另一个子视图的序号。必填。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没传 `withSubviewAtIndex`：`exchangeSubviewAtIndex needs { withSubviewAtIndex }`。
- 序号转不出有限的数：`exchangeSubviewAtIndex must be a finite number, got …`（第二个序号是 `withSubviewAtIndex must be …`）。

序号超出范围时的结果**未在模拟器验证**。

## 说明

这个方法是后补的，没有在模拟器上调过，效果**未在模拟器验证**。

## 示例

```js
const page = new UIView();
const a = new UIView();
const b = new UIView();
page.addSubview(a);
page.addSubview(b);

page.exchangeSubviewAtIndex(0, { withSubviewAtIndex: 1 });
console.log(page.subviews[0] === b);
```

**结果**：输出 `true`，`b` 换到了 `a` 下面。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView exchangeSubviewAtIndex:withSubviewAtIndex:]`。

## 参见

- [`bringSubviewToFront()`](bringsubviewtofront.md)、[`insertSubview()`](insertsubview.md)
