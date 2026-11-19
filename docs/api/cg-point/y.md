---
type: reference
native: CGPoint.y
---

# `CGPoint`：`y` 属性

**`y`** 属性是点的纵坐标。

## 值

数，单位 [pt](../units.md)。坐标原点在左上角，`y` 向下增大。

- 只读。给它赋值抛 `TypeError: y is read-only: structs are values, assign a whole new one instead`。
- 值在构造时确定，之后不变。

## 示例

```js
const p = new CGPoint(10, 20);
console.log(p.y);
```

**结果**：输出 `20`。

## 对应的 iOS API

C 结构体的字段 `CGPoint.y`。

## 参见

- [`CGPoint()`](constructor.md)：构造时给出这个字段
- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
