---
type: reference
native: "-[UIView effectiveRadiusForCorner:]"
---

# `UIView`：`effectiveRadiusForCorner()` 方法

**`effectiveRadiusForCorner()`** 方法返回视图某个角实际的圆角半径。

## 语法

```
effectiveRadiusForCorner(corner)
```

### 参数

**`corner`**

角的名字的数组：`'topLeft'`、`'topRight'`、`'bottomLeft'`、`'bottomRight'`。

### 返回值

数，单位 [pt](../units.md)。

### 异常

写了不认识的角的名字时的行为**未在模拟器验证**。

## 说明

这个方法是后补的，没有在模拟器上调过，效果**未在模拟器验证**。

## 示例

```js
const card = new UIView();
card.layer.cornerRadius = 12;
console.log(card.effectiveRadiusForCorner(['topLeft']));
```

**结果**：输出 `12`。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView effectiveRadiusForCorner:]`。`UIRectCornerTopLeft` 写成 `['topLeft']`。

## 参见

- [`layer`](layer.md)：`cornerRadius`
