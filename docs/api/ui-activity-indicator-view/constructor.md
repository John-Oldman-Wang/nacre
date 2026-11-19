---
type: reference
native: "-[UIActivityIndicatorView init]"
---

# `UIActivityIndicatorView()` 构造函数

**`UIActivityIndicatorView()`** 构造函数创建一个转圈。新建的转圈是隐藏的，没在转，`frame` 是 0 × 0。

## 语法

```
new UIActivityIndicatorView()
```

### 参数

无。

### 返回值

新建的 `UIActivityIndicatorView`：

- [`activityIndicatorViewStyle`](activityindicatorviewstyle.md) 是 `'medium'`。
- [`isAnimating`](isanimating.md) 是 `false`，[`hidesWhenStopped`](hideswhenstopped.md) 是 `true`，所以 `isHidden` 是 `true`。
- [`color`](color.md) 是 `'secondaryLabel'`。
- `frame` 宽 0、高 0。它想要的大小（`intrinsicContentSize`）是 20 × 20 [pt](../units.md)。

用 Auto Layout 定位时只需要约束位置，它自动取想要的大小。用 `frame` 定位时调一次 `sizeToFit()`。

### 异常

**`TypeError`**

继承这个类再 `new`：`class X extends UIActivityIndicatorView {}` 在 `new X()` 时抛，见[原生类](../native-classes.md)。

## 示例

```js
const spinner = new UIActivityIndicatorView();
console.log(spinner.isHidden, spinner.frame.width);
spinner.sizeToFit();
console.log(spinner.frame.width, spinner.frame.height);
```

**结果**：先输出 `true 0`，`sizeToFit()` 之后输出 `20 20`。

## 对应的 iOS API

`-[UIActivityIndicatorView init]`。`initWithActivityIndicatorStyle:` 没有对应的构造参数，创建后写 `activityIndicatorViewStyle`。

## 参见

- [`startAnimating()`](startanimating.md)：开始转，同时显示出来
