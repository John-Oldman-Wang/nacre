---
type: reference
native: NSDirectionalEdgeInsetsMake
---

# `NSDirectionalEdgeInsets()` 构造函数

**`NSDirectionalEdgeInsets()`** 构造函数创建一组带方向的边距。

## 语法

```
new NSDirectionalEdgeInsets([top[, leading[, bottom[, trailing]]]])
```

### 参数

**`top`**、**`leading`**、**`bottom`**、**`trailing`**

上、文字开始的一侧、下、文字结束的一侧各自向内缩进多少，单位 [pt](../units.md)。

每个参数按数转换：

- 不给（`undefined`）时这个字段是 0。
- 能转成数的值（`'3'`、`null`、`true`）按 `Number()` 的结果使用：`3`、`0`、`1`。类型检查会报错，不推荐这样写。

### 返回值

新建的 `NSDirectionalEdgeInsets`。它的字段只读，见[结构体](../structs.md#字段只读要改就整体换一个)。

### 异常

**`TypeError`**

某个参数转不成有限的数（`NaN`、`Infinity`、`'abc'`）：`a struct field must be a finite number, got NaN`，末尾是收到的值。

## 示例

```js
const margins = new NSDirectionalEdgeInsets(8, 16, 8, 16);
console.log(String(margins));
```

**结果**：输出 `NSDirectionalEdgeInsets(8, 16, 8, 16)`。

## 对应的 iOS API

`NSDirectionalEdgeInsetsMake`。

## 参见

- [`UIEdgeInsets`](../ui-edge-insets.md)：左右固定的边距
- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
