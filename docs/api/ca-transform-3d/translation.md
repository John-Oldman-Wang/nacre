---
type: reference
native: CATransform3DMakeTranslation
---

# `CATransform3D.translation()` 静态方法

**`CATransform3D.translation()`** 静态方法创建一个平移变换。

## 语法

```
CATransform3D.translation(tx, ty[, tz])
```

### 参数

**`tx`**

x 方向移动多少，单位 [pt](../units.md)，向右为正。

**`ty`**

y 方向移动多少，单位 pt，向下为正。

**`tz`**

z 方向移动多少，单位 pt，向着看屏幕的人为正。不给时是 0。

### 返回值

新的 `CATransform3D`：单位矩阵，`m41`、`m42`、`m43` 换成给的 `tx`、`ty`、`tz`。

### 异常

**`TypeError`**

参数转不成有限的数：`a struct field must be a finite number, got …`，末尾是收到的值。

## 示例

```js
const move = CATransform3D.translation(10, 20, 30);
console.log(String(move));
console.log(CATransform3D.translation(10, 20).m43);
```

**结果**

- 第一行输出 `CATransform3D(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 20, 30, 1)`。
- 第二行输出 `0`：不给 `tz` 时是 0。

## 对应的 iOS API

`CATransform3DMakeTranslation(tx, ty, tz)`。ObjC 里三个参数都要给，这里 `tz` 可以不给。

## 参见

- [`translate()`](translate.md)：在已有的变换前面加一步平移
- [`concat()`](concat.md)：先后顺序会影响平移量
- [结构体](../structs.md)：所有结构体共同的规则
