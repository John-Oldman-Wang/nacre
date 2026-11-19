---
type: reference
native: CGSize.height
---

# `CGSize`：`height` 属性

**`height`** 属性是高。

## 值

数，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError: height is read-only: structs are values, assign a whole new one instead`。
- 值在构造时确定，之后不变。

## 示例

```js
const s = new CGSize(100, 50);
console.log(s.height);
```

**结果**：输出 `50`。

## 对应的 iOS API

C 结构体的字段 `CGSize.height`。

## 参见

- [`CGSize()`](constructor.md)：构造时给出这个字段
- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
