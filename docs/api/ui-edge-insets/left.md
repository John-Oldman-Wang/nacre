---
type: reference
native: UIEdgeInsets.left
---

# `UIEdgeInsets`：`left` 属性

**`left`** 属性是左边向内缩进的距离。

## 值

数，单位 [pt](../units.md)。`left` 固定是屏幕的左侧，不随文字方向变。

- 只读。给它赋值抛 `TypeError: left is read-only: structs are values, assign a whole new one instead`。
- 值在构造时确定，之后不变。

## 示例

```js
const insets = new UIEdgeInsets(8, 16, 4, 12);
console.log(insets.left);
```

**结果**：输出 `16`。

## 对应的 iOS API

C 结构体的字段 `UIEdgeInsets.left`。

## 参见

- [`UIEdgeInsets()`](constructor.md)：构造时给出这个字段
- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
