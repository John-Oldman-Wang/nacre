---
type: reference
native: CGAffineTransformMakeTranslation
---

# `CGAffineTransform.translation()` 静态方法

**`CGAffineTransform.translation()`** 静态方法创建一个平移变换。

## 语法

```
CGAffineTransform.translation(tx, ty)
```

### 参数

**`tx`**

横向移动多少，单位 [pt](../units.md)，向右为正。

**`ty`**

纵向移动多少，单位 pt，向下为正。

不给的参数是 0。

### 返回值

新的 `CGAffineTransform`：`a` 和 `d` 是 1，`tx`、`ty` 是给的值，其余是 0。

### 异常

**`TypeError`**

参数转不成有限的数：`a struct field must be a finite number, got …`。

## 示例

```js
const move = CGAffineTransform.translation(10, 20);
console.log(String(move));
```

**结果**：输出 `CGAffineTransform(1, 0, 0, 1, 10, 20)`。

## 对应的 iOS API

`CGAffineTransformMakeTranslation(tx, ty)`。

## 参见

- [`concat()`](concat.md)：先后顺序会影响平移量
- [结构体](../structs.md)：所有结构体共同的规则
