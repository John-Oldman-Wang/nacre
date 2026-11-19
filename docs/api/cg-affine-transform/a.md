---
type: reference
native: CGAffineTransform.a
---

# `CGAffineTransform`：`a` 属性

**`a`** 属性是矩阵第一行第一列的数。只有缩放时它是横向的倍数。

## 值

数，比例，没有单位。在矩阵里的位置：

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

- 只读。给它赋值抛 `TypeError: a is read-only: structs are values, assign a whole new one instead`。

## 示例

```js
const t = CGAffineTransform.scale(2, 3).concat(CGAffineTransform.translation(10, 20));
console.log(t.a);
```

**结果**：输出 `2`。

## 对应的 iOS API

C 结构体的字段 `CGAffineTransform.a`。

## 参见

- [`CGAffineTransform()`](constructor.md)
- [结构体](../structs.md)：所有结构体共同的规则
