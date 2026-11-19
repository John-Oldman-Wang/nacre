---
type: reference
native: CGAffineTransform.d
---

# `CGAffineTransform`：`d` 属性

**`d`** 属性是矩阵第二行第二列的数。只有缩放时它是纵向的倍数。

## 值

数，比例，没有单位。在矩阵里的位置：

```
| a  b  0 |
| c  d  0 |
| tx ty 1 |
```

- 只读。给它赋值抛 `TypeError: d is read-only: structs are values, assign a whole new one instead`。

## 示例

```js
const t = CGAffineTransform.scale(2, 3).concat(CGAffineTransform.translation(10, 20));
console.log(t.d);
```

**结果**：输出 `3`。

## 对应的 iOS API

C 结构体的字段 `CGAffineTransform.d`。

## 参见

- [`CGAffineTransform()`](constructor.md)
- [结构体](../structs.md)：所有结构体共同的规则
