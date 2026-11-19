---
type: reference
native: CGAffineTransform.b
---

# `CGAffineTransform`：`b` 属性

**`b`** 属性是矩阵第一行第二列的数。只有缩放和平移时它是 0。

## 值

数，比例，没有单位。在矩阵里的位置：

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

- 只读。给它赋值抛 `TypeError: b is read-only: structs are values, assign a whole new one instead`。

## 示例

```js
const t = CGAffineTransform.scale(2, 3).concat(CGAffineTransform.translation(10, 20));
console.log(t.b);
```

**结果**：输出 `0`。

## 对应的 iOS API

C 结构体的字段 `CGAffineTransform.b`。

## 参见

- [`CGAffineTransform()`](constructor.md)
- [结构体](../structs.md)：所有结构体共同的规则
