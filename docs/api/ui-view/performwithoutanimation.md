---
type: reference
native: "+[UIView performWithoutAnimation:]"
---

# `UIView.performWithoutAnimation()` 静态方法

**`UIView.performWithoutAnimation()`** 静态方法执行一段代码，它里面对视图的改动不带动画，即使它是在 [`animateWithDuration()`](animatewithduration.md) 的 `animations` 里面调的。

## 语法

```
UIView.performWithoutAnimation(actions)
```

### 参数

**`actions`**

函数，没有参数。它在这次调用里当场执行，调用返回时已经执行完。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`actions` 不是函数：`UIView.performWithoutAnimation: actions must be a function`。

`actions` 里抛出的异常原样抛给调用方。

## 示例

```js
const dot = new UIView();
const badge = new UIView();

UIView.animateWithDuration(0.3, {
  animations() {
    dot.alpha = 0.5;
    UIView.performWithoutAnimation(() => {
      badge.alpha = 0;
    });
  },
});
```

**效果**：`dot` 在 0.3 秒里变成半透明，`badge` 立刻变成全透明，没有渐变的过程。实测 `performWithoutAnimation()` 里改的属性生效了，图层上没有因此多出动画。

## 对应的 iOS API

`+[UIView performWithoutAnimation:]`。

## 参见

- [`animateWithDuration()`](animatewithduration.md)
