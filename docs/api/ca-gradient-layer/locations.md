---
type: reference
native: CAGradientLayer.locations
---

# `CAGradientLayer`：`locations` 属性

**`locations`** 属性给出每个颜色在渐变上的位置。

## 值

数的数组，或者 `null`。每一项是 0 到 1 的比例：0 是起点，1 是终点。

- 可读，可写。
- 默认值是 `null`，颜色均匀分布。
- 个数应当和 [`colors`](colors.md) 相同。个数不同时的效果**未在模拟器验证**。

### 写错时

**`TypeError`**

- 某一项转换不出有限数：`locations[0] must be a finite number, got …`。
- 给的不是数组也不是 `null`：`locations must be an array of numbers or null, got …`。

## 示例

```js
const gradient = new CAGradientLayer();
gradient.colors = ['#5856D6', '#FF2D55', '#FF9500'];
gradient.locations = [0, 0.3, 1];
```

**效果**：从紫色开始，到 30% 处变成粉红色，到终点变成橙色。**未在模拟器验证。**

## 对应的 iOS API

`CAGradientLayer.locations`。`@[@0, @0.3, @1]` 写成 `[0, 0.3, 1]`。

## 参见

- [`colors`](colors.md)
