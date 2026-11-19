---
type: reference
native: "-[UIView layoutIfNeeded]"
---

# `UIView`：`layoutIfNeeded()` 方法

**`layoutIfNeeded()`** 方法在有待处理的布局时立刻完成它：这个视图和它的后代。

## 语法

```
layoutIfNeeded()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 约束不是立刻生效的，系统在当前这段 JS 执行完之后、下一次屏幕刷新之前统一计算一次。激活约束或改了 `constant` 之后要立刻读 `frame`，先调它。
- 要在**共同的祖先**上调。推荐调在页面的根视图 `page.view` 上，这样页面里所有视图的 `frame` 都是新的。
- 只是设置界面、之后不读 `frame` 的代码，不需要调它。
- 在 [`UIView.animateWithDuration()`](animatewithduration.md) 的 `animations` 里调它，约束的改动带动画地生效。

## 示例

```js
const page = new UIView();
const banner = new UIView();
banner.translatesAutoresizingMaskIntoConstraints = false;
page.addSubview(banner);
NSLayoutConstraint.activateConstraints([
  banner.widthAnchor.constraintEqualToConstant(200),
  banner.heightAnchor.constraintEqualToConstant(60),
]);

page.layoutIfNeeded();
console.log(banner.frame.width, banner.frame.height);
```

**结果**：输出 `200 60`。不调 `layoutIfNeeded()` 就读 `frame`，读到的是上一次布局的结果。

## 对应的 iOS API

`-[UIView layoutIfNeeded]`。

## 参见

- [`setNeedsLayout()`](setneedslayout.md)
- [约束什么时候算出结果](../auto-layout.md#约束什么时候算出结果)
- [带动画地改约束](../../guides/view-animations.md#带动画地改约束)
