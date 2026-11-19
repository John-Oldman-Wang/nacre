---
type: reference
native: CALayer.cornerRadius
---

# `CALayer`：`cornerRadius` 属性

**`cornerRadius`** 属性是圆角半径。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `0`，直角。
- 圆角只作用于图层自己的底色和边框。子视图和子图层仍然是直角，会画到圆角外面；要裁掉，设 `masksToBounds`（视图上是 `clipsToBounds`）为 `true`。
- 哪几个角是圆角由 [`maskedCorners`](maskedcorners.md) 决定，曲线由 [`cornerCurve`](cornercurve.md) 决定。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const card = new UIView();
card.layer.cornerRadius = 16;
console.log(card.layer.cornerRadius);
```

**效果**：卡片的底色和边框的四个角变成半径 16 pt 的圆角。控制台输出 `16`。

## 对应的 iOS API

`CALayer.cornerRadius`。

## 参见

- [`maskedCorners`](maskedcorners.md)、[`cornerCurve`](cornercurve.md)
