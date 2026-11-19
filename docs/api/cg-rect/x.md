---
type: reference
native: CGRect.origin.x
---

# `CGRect`：`x` 属性

**`x`** 属性是矩形左上角的横坐标。

## 值

数，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError: x is read-only: structs are values, assign a whole new one instead`。
- 值在构造时确定，之后不变。

## 示例

```js
const r = new CGRect(10, 20, 100, 50);
console.log(r.x);
```

**结果**：输出 `10`。

## 对应的 iOS API

`rect.origin.x`。ObjC 的 `CGRect` 是 `origin` 和 `size` 两层，这里在矩形上直接读 `rect.x`，嵌套的写法 `rect.origin.x` 也能用。

## 参见

- [`CGRect()`](constructor.md)：构造时给出这个字段
- [`origin`](origin.md)：同一组数的嵌套写法
- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
