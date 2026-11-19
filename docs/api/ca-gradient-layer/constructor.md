---
type: reference
native: "-[CAGradientLayer init]"
---

# `CAGradientLayer()` 构造函数

**`CAGradientLayer()`** 构造函数创建一个渐变图层。

## 语法

```
new CAGradientLayer()
```

### 参数

无。

### 返回值

新建的 `CAGradientLayer`：`frame` 是 `(0, 0, 0, 0)`，[`colors`](colors.md) 是空数组，从上到下的直线渐变。设好颜色和 `frame` 并加到父图层下面才看得见。

### 异常

**`TypeError`**

不能被继承，见[原生类](../native-classes.md)。

## 示例

```js
const gradient = new CAGradientLayer();
console.log(gradient.colors.length, gradient.type);
```

**结果**：控制台输出 `0 axial`。

## 对应的 iOS API

`[CAGradientLayer layer]`。

## 参见

- [`colors`](colors.md)
