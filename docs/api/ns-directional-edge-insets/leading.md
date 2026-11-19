---
type: reference
native: NSDirectionalEdgeInsets.leading
---

# `NSDirectionalEdgeInsets`：`leading` 属性

**`leading`** 属性是文字开始的一侧向内缩进的距离。

## 值

数，单位 [pt](../units.md)。从左往右书写的语言里是左侧，从右往左书写的语言里是右侧。从右往左时的对调效果**未在模拟器验证**。

- 只读。给它赋值抛 `TypeError: leading is read-only: structs are values, assign a whole new one instead`。
- 值在构造时确定，之后不变。

## 示例

```js
const m = new NSDirectionalEdgeInsets(8, 16, 4, 12);
console.log(m.leading);
```

**结果**：输出 `16`。

## 对应的 iOS API

C 结构体的字段 `NSDirectionalEdgeInsets.leading`。

## 参见

- [`NSDirectionalEdgeInsets()`](constructor.md)：构造时给出这个字段
- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
