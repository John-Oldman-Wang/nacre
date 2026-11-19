---
type: reference
native: CAGradientLayer.colors
---

# `CAGradientLayer`：`colors` 属性

**`colors`** 属性是渐变依次经过的颜色。

## 值

写入时是[颜色](../ui-color.md)的数组，每一项是颜色字符串或 `UIColor` 对象；读出来是颜色字符串的数组。

- 可读，可写。
- 默认值是空数组 `[]`。
- 至少要有两个颜色。只有一个或者为空时不画渐变。**未在模拟器验证。**
- 不设 [`locations`](locations.md) 时颜色均匀分布。
- 读出来是字符串，但不一定是写进去的那个串：随深浅色模式变化的颜色在写入那一刻按图层所属视图当时的模式换算成一个固定的颜色，读回来是换算后的值，之后切换模式不会变。见[图层上的颜色](../ca-layer.md#图层上的颜色)。

### 写错时

数组里只要有一个颜色写错，整个数组都不写入，原来的渐变不变，控制台输出一条警告。

## 示例

```js
const gradient = new CAGradientLayer();
gradient.colors = ['#5856D6', '#FF2D55'];
console.log(gradient.colors.length);
```

**结果**：控制台输出 `2`。显示出来从顶部的紫色均匀过渡到底部的粉红色。

## 对应的 iOS API

`CAGradientLayer.colors`。ObjC 里是 `CGColor` 的数组，这里写颜色字符串。

## 参见

- [`locations`](locations.md)
- [`UIColor`](../ui-color.md)
