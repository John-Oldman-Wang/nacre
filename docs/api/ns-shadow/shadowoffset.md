---
type: reference
native: NSShadow.shadowOffset
---

# `NSShadow`：`shadowOffset` 属性

**`shadowOffset`** 属性是阴影相对文字偏多少。

## 值

[`CGSize`](../structs.md)，单位 [pt](../units.md)。

- 可读，可写。
- 默认值是 `(0, 0)`。
- `width` 为正是往右，`height` 为正是往下。负数是往左、往上。
- 写入时可以给 `CGSize`，也可以给 `{ width, height }`。读出来的 `CGSize` 是只读的，要改就赋一个新的值。

### 写错时

**`TypeError`**

给的不是对象，或者缺字段、字段不是有限的数，比如 `shadowOffset is missing height, or it is not a finite number`。

## 示例

```js
const shadow = new NSShadow();
shadow.shadowOffset = { width: 1, height: 2 };
console.log(shadow.shadowOffset.width, shadow.shadowOffset.height);
```

**结果**：控制台输出 `1 2`。

## 对应的 iOS API

`NSShadow.shadowOffset`。

## 参见

- [结构体](../structs.md)
