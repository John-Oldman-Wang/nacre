---
type: reference
native: "-[UIActivityIndicatorView stopAnimating]"
---

# `UIActivityIndicatorView`：`stopAnimating()` 方法

**`stopAnimating()`** 方法让转圈停下。[`hidesWhenStopped`](hideswhenstopped.md) 是 `true` 时，它同时把转圈隐藏。

## 语法

```
stopAnimating()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 说明

- 调用之后 [`isAnimating`](isanimating.md) 是 `false`。
- `hidesWhenStopped` 是 `true` 时，继承的 `isHidden` 变成 `true`；是 `false` 时转圈留在屏幕上，不再旋转。
- 没在转时调用没有效果。

## 示例

```js
const spinner = new UIActivityIndicatorView();
spinner.startAnimating();
spinner.stopAnimating();
console.log(spinner.isAnimating, spinner.isHidden);
```

**结果**：输出 `false true`。

## 对应的 iOS API

`-[UIActivityIndicatorView stopAnimating]`。

## 参见

- [`startAnimating()`](startanimating.md)
