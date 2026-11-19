---
type: reference
native: "+[UIBezierPath bezierPathWithRoundedRect:cornerRadius:]"
---

# `UIBezierPath.bezierPathWithRoundedRect()` 静态方法

**`UIBezierPath.bezierPathWithRoundedRect()`** 静态方法创建一个圆角矩形。可以四个角都是圆角，也可以只让列出的几个角是圆角。

只是给一个视图加圆角时，不需要路径，用 `view.layer.cornerRadius`，见 [`CALayer`](../ca-layer.md)。

## 语法

```
UIBezierPath.bezierPathWithRoundedRect(rect, { cornerRadius })
UIBezierPath.bezierPathWithRoundedRect(rect, { byRoundingCorners, cornerRadii })
```

### 参数

**`rect`**

矩形的位置和大小，`CGRect`，单位是 [pt](../units.md)。也可以写成普通对象 `{ x, y, width, height }`。

**`options`**

下面两组选项二选一。两组都给时，用 `byRoundingCorners` 那一组。

**`options.cornerRadius`**

数，单位是 pt。四个角都是圆角，半径都是它。

**`options.byRoundingCorners`**

角名的数组，只有列出的角是圆角。四个角都要时把四个名字都写上：

| 角名 | 哪个角 |
| --- | --- |
| `'topLeft'` | 左上 |
| `'topRight'` | 右上 |
| `'bottomLeft'` | 左下 |
| `'bottomRight'` | 右下 |

**`options.cornerRadii`**

`CGSize`，和 `byRoundingCorners` 一起给。`width` 是圆角的横向半径，`height` 是纵向半径，单位是 pt。两个值不同时圆角是一段椭圆弧，**这种形状未在模拟器验证**。

### 返回值

新建的 `UIBezierPath`。它的 [`bounds`](bounds.md) 就是 `rect`。

### 异常

**`TypeError`**

- 两组选项都没给：`bezierPathWithRoundedRect needs { cornerRadius } or { byRoundingCorners, cornerRadii }`。
- `byRoundingCorners` 里有不认识的角名：报错信息里列出四个角名。
- `cornerRadii` 不是对象：`cornerRadii needs an object with all of: width, height`。
- `cornerRadius` 转不成有限数。
- `rect` 写错，报错的写法和 [`bezierPathWithRect()`](bezierpathwithrect.md#异常) 相同，开头是 `bezierPathWithRoundedRect`。

## 示例

### 四个角一样圆

```js
const rounded = UIBezierPath.bezierPathWithRoundedRect(
  new CGRect(0, 0, 120, 60), { cornerRadius: 8 });
```

**结果**：一个 120 × 60 pt 的矩形，四个角是半径 8 pt 的圆角。

### 只有上面两个角是圆角

```js
const tab = UIBezierPath.bezierPathWithRoundedRect(new CGRect(0, 0, 120, 60), {
  byRoundingCorners: ['topLeft', 'topRight'],
  cornerRadii: new CGSize(12, 12),
});
```

**结果**：上面两个角是半径 12 pt 的圆角，下面两个角是直角。**未在模拟器验证。**

## 对应的 iOS API

`+[UIBezierPath bezierPathWithRoundedRect:cornerRadius:]` 和 `+[UIBezierPath bezierPathWithRoundedRect:byRoundingCorners:cornerRadii:]`。`UIRectCorner` 的位掩码写成角名的数组，`UIRectCornerTopLeft` 写成 `'topLeft'`；`UIRectCornerAllCorners` 写成四个角名的数组。

## 参见

- [`bezierPathWithRect()`](bezierpathwithrect.md)：直角矩形
- [枚举](../enums.md)：位掩码为什么写成数组
