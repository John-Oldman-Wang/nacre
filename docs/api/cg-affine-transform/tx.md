---
type: reference
native: CGAffineTransform.tx
---

# `CGAffineTransform`：`tx` 属性

**`tx`** 属性是横向的平移量。

## 值

数，单位 [pt](../units.md)。在矩阵里的位置：

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

- 只读。给它赋值抛 `TypeError: tx is read-only: structs are values, assign a whole new one instead`。

## 示例

```js
const t = CGAffineTransform.scale(2, 3).concat(CGAffineTransform.translation(10, 20));
console.log(t.tx);
```

**结果**：输出 `10`。

## 对应的 iOS API

C 结构体的字段 `CGAffineTransform.tx`。

## 参见

- [`CGAffineTransform()`](constructor.md)
- [结构体](../structs.md)：所有结构体共同的规则
