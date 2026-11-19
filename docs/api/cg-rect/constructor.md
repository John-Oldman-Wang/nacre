---
type: reference
native: CGRectMake
---

# `CGRect()` 构造函数

**`CGRect()`** 构造函数创建一个矩形：左上角的位置加尺寸。

## 语法

```
new CGRect([x[, y[, width[, height]]]])
```

### 参数

**`x`**、**`y`**

矩形左上角的坐标，单位 [pt](../units.md)。

**`width`**、**`height`**

矩形的宽和高，单位 pt。

每个参数按数转换：

- 不给（`undefined`）时这个字段是 0。
- 能转成数的值（`'3'`、`null`、`true`）按 `Number()` 的结果使用：`3`、`0`、`1`。类型检查会报错，不推荐这样写。

### 返回值

新建的 `CGRect`。它的字段只读，见[结构体](../structs.md#字段只读要改就整体换一个)。

### 异常

**`TypeError`**

某个参数转不成有限的数（`NaN`、`Infinity`、`'abc'`）：`a struct field must be a finite number, got NaN`，末尾是收到的值。

## 示例

```js
const r = new CGRect(10, 20, 100, 50);
console.log(String(r));
// @ts-expect-error 类型要求四个参数；运行时不给的字段按 0
console.log(String(new CGRect()));
```

**结果**：依次输出 `CGRect(10, 20, 100, 50)`、`CGRect(0, 0, 0, 0)`。

## 对应的 iOS API

`CGRectMake`。

## 参见

- [`origin`](origin.md) 和 [`size`](size.md)：按嵌套的写法读同一组数
- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
