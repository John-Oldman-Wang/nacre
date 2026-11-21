---
type: reference
native: CATransform3DMakeScale
---

# `CATransform3D.scale()` 静态方法

**`CATransform3D.scale()`** 静态方法创建一个缩放变换。

同名的实例方法 [`scale()`](scale.md) 在一个已有的变换前面加一步缩放。

## 语法

```
CATransform3D.scale(sx[, sy[, sz]])
```

### 参数

**`sx`**

x 方向的倍数，比例，`1` 表示不变。

**`sy`**

y 方向的倍数。不给时和 `sx` 相同。

**`sz`**

z 方向的倍数。不给时是 `1`，所以 `CATransform3D.scale(2)` 只在 x、y 两个方向放大。

### 返回值

新的 `CATransform3D`：`m11`、`m22`、`m33` 是三个方向的倍数，`m44` 是 1，其余是 0。

### 异常

**`TypeError`**

参数转不成有限的数：`a struct field must be a finite number, got …`，末尾是收到的值。

## 示例

```js
const grow = CATransform3D.scale(2);
console.log(grow.m11, grow.m22, grow.m33);

const all = CATransform3D.scale(2, 3, 4);
console.log(all.m11, all.m22, all.m33);
```

**结果**

- 第一行输出 `2 2 1`：只给一个参数时 x、y 相同，z 不变。
- 第二行输出 `2 3 4`。

## 对应的 iOS API

`CATransform3DMakeScale(sx, sy, sz)`。ObjC 里三个参数都要给。

## 参见

- [`scale()`](scale.md)：同名的实例方法
- [`concat()`](concat.md)：和别的变换组合
- [结构体](../structs.md)：所有结构体共同的规则
