---
type: reference
native: "-[UIView exerciseAmbiguityInLayout]"
---

# `UIView`：`exerciseAmbiguityInLayout()` 方法

**`exerciseAmbiguityInLayout()`** 方法让视图在几种可能的结果之间切换一次，方便用眼睛看出哪里约束不够。

## 语法

```
exerciseAmbiguityInLayout()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
const card = new UIView();
if (card.hasAmbiguousLayout) {
  card.exerciseAmbiguityInLayout();
}
```

**效果**：约束不够时，视图跳到另一个同样满足约束的位置或大小。**效果未在模拟器验证。**

## 对应的 iOS API

`-[UIView exerciseAmbiguityInLayout]`。

## 参见

- [`hasAmbiguousLayout`](hasambiguouslayout.md)
