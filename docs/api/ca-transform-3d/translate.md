---
type: reference
native: CATransform3DTranslate
---

# `CATransform3D`：`translate()` 方法

**`translate()`** 方法在调用者前面加一步平移：先平移，再做调用者的变换。

## 语法

```
translate(tx, ty[, tz])
```

### 参数

**`tx`**、**`ty`**、**`tz`**

三个方向的平移量，单位 [pt](../units.md)，和 [`CATransform3D.translation()`](translation.md) 的参数相同。`tz` 不给时是 0。

### 返回值

新的 `CATransform3D`，等于 `CATransform3D.translation(tx, ty, tz).concat(调用者)`。调用者不变。

### 异常

**`TypeError`**

参数转不成有限的数：`a struct field must be a finite number, got …`，末尾是收到的值。

## 说明

平移在前，所以调用者里的缩放和旋转也作用在平移量上。要让平移量不受影响，把平移放在后面：`t.concat(CATransform3D.translation(tx, ty, tz))`。

## 示例

```js
const grow = CATransform3D.scale(2);
console.log(grow.translate(10, 0, 0).m41);
console.log(grow.concat(CATransform3D.translation(10, 0, 0)).m41);
```

**结果**

- 第一行输出 `20`：先平移 10 pt，再放大 2 倍，平移量也变成 20 pt。
- 第二行输出 `10`：平移放在后面，不受缩放影响。

## 对应的 iOS API

`CATransform3DTranslate(t, tx, ty, tz)` 写成 `t.translate(tx, ty, tz)`，顺序相同。

## 参见

- [`CATransform3D.translation()`](translation.md)
- [组合的顺序](../ca-transform-3d.md#组合的顺序)
- [结构体](../structs.md)：所有结构体共同的规则
