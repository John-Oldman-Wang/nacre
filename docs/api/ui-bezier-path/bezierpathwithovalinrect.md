---
type: reference
native: "+[UIBezierPath bezierPathWithOvalInRect:]"
---

# `UIBezierPath.bezierPathWithOvalInRect()` 静态方法

**`UIBezierPath.bezierPathWithOvalInRect()`** 静态方法创建一个矩形的内切椭圆。给的矩形是正方形时，得到的是圆。

## 语法

```
UIBezierPath.bezierPathWithOvalInRect(rect)
```

### 参数

**`rect`**

椭圆的外接矩形，`CGRect`，单位是 [pt](../units.md)。也可以写成普通对象 `{ x, y, width, height }`。

### 返回值

新建的 `UIBezierPath`。它的 [`bounds`](bounds.md) 就是 `rect`。

### 异常

**`TypeError`**

- `rect` 不是对象：`bezierPathWithOvalInRect needs an object with all of: x, y, width, height`。
- 某个字段缺失或转不成有限数：`bezierPathWithOvalInRect is missing height, or it is not a finite number`（`height` 换成实际缺的那个字段）。

## 示例

```js
const oval = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 80, 50));
const circle = UIBezierPath.bezierPathWithOvalInRect(new CGRect(0, 0, 50, 50));
console.log(String(circle.bounds));
```

**结果**：`oval` 是 80 × 50 pt 的椭圆。`circle` 是直径 50 pt 的圆。控制台输出 `CGRect(0, 0, 50, 50)`。

## 对应的 iOS API

`+[UIBezierPath bezierPathWithOvalInRect:]`。

## 参见

- [`bezierPathWithArcCenter()`](bezierpathwitharccenter.md)：按圆心和半径画圆或圆弧
