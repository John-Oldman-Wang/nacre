---
type: reference
native: CAFrameRateRangeMake
---

# `CAFrameRateRange()` 构造函数

**`CAFrameRateRange()`** 构造函数创建一个帧率区间，给 [`CADisplayLink`](../ca-animation.md) 的 `preferredFrameRateRange`。

## 语法

```
new CAFrameRateRange([minimum[, maximum[, preferred]]])
```

### 参数

**`minimum`**

最低帧率，单位是帧每秒。

**`maximum`**

最高帧率，单位是帧每秒。

**`preferred`**

最希望的帧率，单位是帧每秒。可以不给，不给时是 0。

三个都是 0 表示由系统决定。

每个参数按数转换：

- 不给（`undefined`）时这个字段是 0。
- 能转成数的值（`'3'`、`null`、`true`）按 `Number()` 的结果使用：`3`、`0`、`1`。类型检查会报错，不推荐这样写。

### 返回值

新建的 `CAFrameRateRange`。它的字段只读，见[结构体](../structs.md#字段只读要改就整体换一个)。

### 异常

**`TypeError`**

某个参数转不成有限的数（`NaN`、`Infinity`、`'abc'`）：`a struct field must be a finite number, got NaN`，末尾是收到的值。

写入 `preferredFrameRateRange` 时给普通对象，三个字段（`minimum`、`maximum`、`preferred`）都要有，少一个抛 `TypeError`。这一点和构造函数不同：构造函数里 `preferred` 可以不给。

## 示例

```js
const range = new CAFrameRateRange(30, 60, 30);
console.log(String(range));
console.log(String(new CAFrameRateRange(30, 60)));
```

**结果**：依次输出 `CAFrameRateRange(30, 60, 30)`、`CAFrameRateRange(30, 60, 0)`。

## 对应的 iOS API

`CAFrameRateRangeMake`。

## 参见

- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
