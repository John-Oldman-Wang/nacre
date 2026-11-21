---
type: reference
native: CATransform3DScale
---

# `CATransform3D`：`scale()` 方法

**`scale()`** 方法在调用者前面加一步缩放：先缩放，再做调用者的变换。

同名的静态方法 [`CATransform3D.scale()`](scale-static.md) 创建一个只有缩放的变换。

## 语法

```
scale(sx[, sy[, sz]])
```

### 参数

**`sx`**、**`sy`**、**`sz`**

三个方向的倍数，比例，和 [`CATransform3D.scale()`](scale-static.md) 的参数相同：`sy` 不给时和 `sx` 相同，`sz` 不给时是 1。

### 返回值

新的 `CATransform3D`，等于 `CATransform3D.scale(sx, sy, sz).concat(调用者)`。调用者不变。

### 异常

**`TypeError`**

参数转不成有限的数：`a struct field must be a finite number, got …`，末尾是收到的值。

## 说明

缩放在前，所以调用者里的平移量不受这次缩放影响。

## 示例

```js
const move = CATransform3D.translation(10, 0, 0);
const t = move.scale(2);
console.log(t.m11, t.m41);
```

**结果**：输出 `2 10`。放大了 2 倍，平移量仍是 10 pt。

## 对应的 iOS API

`CATransform3DScale(t, sx, sy, sz)` 写成 `t.scale(sx, sy, sz)`，顺序相同。ObjC 里三个参数都要给。

## 参见

- [`CATransform3D.scale()`](scale-static.md)：同名的静态方法
- [组合的顺序](../ca-transform-3d.md#组合的顺序)
- [结构体](../structs.md)：所有结构体共同的规则
