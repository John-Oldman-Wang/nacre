---
type: reference
native: CALayer.borderWidth
---

# `CALayer`：`borderWidth` 属性

**`borderWidth`** 属性是边框的宽度。

## 值

数，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `0`，没有边框。
- 边框画在图层的范围之内，不会让图层变大，沿着圆角走。
- 边框画在底色、子视图和子图层的上面，会盖住边缘的内容。**边框和内容的上下关系未在模拟器验证。**
- 只设 `borderWidth` 不设颜色，得到黑色边框：[`borderColor`](bordercolor.md) 的默认值是不透明的黑色。

### 写错时

写入的值按 `Number()` 转成数。转不成有限数的抛 `TypeError`。

## 示例

```js
const card = new UIView();
card.layer.borderWidth = 2;
card.layer.borderColor = '#5856D6';
```

**效果**：卡片四周出现一圈 2 pt 宽的紫色边框。

## 对应的 iOS API

`CALayer.borderWidth`。

## 参见

- [`borderColor`](bordercolor.md)
