---
type: reference
native: "-[UIActivityIndicatorView startAnimating]"
---

# `UIActivityIndicatorView`：`startAnimating()` 方法

**`startAnimating()`** 方法让转圈开始转。[`hidesWhenStopped`](hideswhenstopped.md) 是 `true` 时，它同时把转圈显示出来。

## 语法

```
startAnimating()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 调用之后 [`isAnimating`](isanimating.md) 是 `true`。
- `hidesWhenStopped` 是 `true` 时，继承的 `isHidden` 变成 `false`。
- 已经在转时调用没有效果。
- 转圈还要加到页面上、有位置才看得见。

## 示例

```js
const spinner = new UIActivityIndicatorView();
console.log(spinner.isHidden);
spinner.startAnimating();
console.log(spinner.isAnimating, spinner.isHidden);
```

**结果**：先输出 `true`，开始之后输出 `true false`。转圈在屏幕上旋转的样子**未在模拟器验证**。

## 对应的 iOS API

`-[UIActivityIndicatorView startAnimating]`。

## 参见

- [`stopAnimating()`](stopanimating.md)
- [显示加载和进度](../../guides/loading-and-progress.md)：在 `finally` 里停下
