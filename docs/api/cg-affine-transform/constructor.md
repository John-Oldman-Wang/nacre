---
type: reference
native: CGAffineTransformMake
---

# `CGAffineTransform()` 构造函数

**`CGAffineTransform()`** 构造函数直接给出矩阵的六个数，创建一个变换。

日常不需要直接填这六个数：用 [`scale()`](scale.md)、[`translation()`](translation.md)、[`rotation()`](rotation.md) 造出基本变换，再用 [`concat()`](concat.md) 组合。这几个方法组合不出需要的变换时才用构造函数。

## 语法

```
new CGAffineTransform([a[, b[, c[, d[, tx[, ty]]]]]])
```

### 参数

**`a`**、**`b`**、**`c`**、**`d`**、**`tx`**、**`ty`**

矩阵里的六个数，位置如下。`tx`、`ty` 是平移量，单位 [pt](../units.md)；其余四个是比例，没有单位。

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

每个参数按数转换。不给的参数是 0，所以 `new CGAffineTransform()` 得到的是六个 0，不是单位矩阵；单位矩阵用 [`CGAffineTransform.identity`](identity.md)。

### 返回值

新建的 `CGAffineTransform`。字段只读。

### 异常

**`TypeError`**

某个参数转不成有限的数：`a struct field must be a finite number, got NaN`，末尾是收到的值。

## 示例

```js
const skew = new CGAffineTransform(1, 0, 0.5, 1, 0, 0);
console.log(String(skew));
```

**结果**：输出 `CGAffineTransform(1, 0, 0.5, 1, 0, 0)`。赋给视图的 `transform` 后视图横向倾斜，**屏幕上的样子未在模拟器验证**。

## 对应的 iOS API

`CGAffineTransformMake(a, b, c, d, tx, ty)`。

## 参见

- [`CGAffineTransform.identity`](identity.md)：单位矩阵
- [结构体](../structs.md)：所有结构体共同的规则
