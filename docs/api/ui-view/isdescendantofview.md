---
type: reference
native: "-[UIView isDescendantOfView:]"
---

# `UIView`：`isDescendantOfView()` 方法

**`isDescendantOfView()`** 方法判断调用者是不是 `view` 的后代。

## 语法

```
isDescendantOfView(view)
```

### 参数

**`view`**

一个 `UIView`。

### 返回值

布尔。调用者是 `view` 的子视图、子视图的子视图……时返回 `true`。`view` 就是调用者自己时也返回 `true`。

### 异常

**`TypeError`**

参数不是视图（别的原生对象、`null`、数字，或者没传）：`isDescendantOfView needs a UIView`。

## 示例

```js
const card = new UIView();
const dot = new UIView();
card.addSubview(dot);
console.log(dot.isDescendantOfView(card), card.isDescendantOfView(dot), card.isDescendantOfView(card));
```

**结果**：输出 `true false true`。

## 对应的 iOS API

`-[UIView isDescendantOfView:]`。

## 参见

- [`addSubview()`](addsubview.md)：加之前可以先用它判断会不会成环
