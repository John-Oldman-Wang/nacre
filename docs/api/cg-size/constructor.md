---
type: reference
native: CGSizeMake
---

# `CGSize()` 构造函数

**`CGSize()`** 构造函数创建一个尺寸。

## 语法

```
new CGSize([width[, height]])
```

### 参数

**`width`**

宽，单位 [pt](../units.md)。

**`height`**

高，单位 pt。

每个参数按数转换：

- 不给（`undefined`）时这个字段是 0。
- 能转成数的值（`'3'`、`null`、`true`）按 `Number()` 的结果使用：`3`、`0`、`1`。类型检查会报错，不推荐这样写。

### 返回值

新建的 `CGSize`。它的字段只读，见[结构体](../structs.md#字段只读要改就整体换一个)。

### 异常

**`TypeError`**

某个参数转不成有限的数（`NaN`、`Infinity`、`'abc'`）：`a struct field must be a finite number, got NaN`，末尾是收到的值。

## 示例

```js
const s = new CGSize(100, 50);
console.log(String(s));
```

**结果**：输出 `CGSize(100, 50)`。

## 对应的 iOS API

`CGSizeMake`。

## 参见

- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
