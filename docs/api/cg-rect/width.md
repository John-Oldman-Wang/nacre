---
type: reference
native: CGRect.size.width
---

# `CGRect`：`width` 属性

**`width`** 属性是矩形的宽。

## 值

数，单位 [pt](../units.md)。

- 只读。给它赋值抛 `TypeError: width is read-only: structs are values, assign a whole new one instead`。
- 值在构造时确定，之后不变。

## 示例

```js
const r = new CGRect(10, 20, 100, 50);
console.log(r.width);
```

**结果**：输出 `100`。

## 对应的 iOS API

`rect.size.width`。ObjC 的 `CGRect` 是 `origin` 和 `size` 两层，这里在矩形上直接读 `rect.width`，嵌套的写法 `rect.size.width` 也能用。

## 参见

- [`CGRect()`](constructor.md)：构造时给出这个字段
- [`size`](size.md)：同一组数的嵌套写法
- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
