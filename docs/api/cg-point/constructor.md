---
type: reference
native: CGPointMake
---

# `CGPoint()` 构造函数

**`CGPoint()`** 构造函数创建一个点。

## 语法

```
new CGPoint([x[, y]])
```

### 参数

**`x`**

横坐标，单位 [pt](../units.md)。

**`y`**

纵坐标，单位 pt。坐标原点在左上角，`y` 向下增大。

每个参数按数转换：

- 不给（`undefined`）时这个字段是 0。
- 能转成数的值（`'3'`、`null`、`true`）按 `Number()` 的结果使用：`3`、`0`、`1`。类型检查会报错，不推荐这样写。

### 返回值

新建的 `CGPoint`。它的字段只读，见[结构体](../structs.md#字段只读要改就整体换一个)。

### 异常

**`TypeError`**

某个参数转不成有限的数（`NaN`、`Infinity`、`'abc'`）：`a struct field must be a finite number, got NaN`，末尾是收到的值。

## 示例

```js
const p = new CGPoint(10, 20);
console.log(String(p));
// @ts-expect-error 类型要求两个参数；运行时不给的字段按 0
console.log(String(new CGPoint()));
```

**结果**：依次输出 `CGPoint(10, 20)`、`CGPoint(0, 0)`。

## 对应的 iOS API

`CGPointMake`。

## 参见

- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
