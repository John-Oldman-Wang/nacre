---
type: reference
native: CGRect.origin
---

# `CGRect`：`origin` 属性

**`origin`** 属性是矩形的左上角，类型是 [`CGPoint`](../cg-point.md)。它和矩形的 `x`、`y` 字段是同一组数。

## 值

[`CGPoint`](../cg-point.md)，等于 `(x, y)`。

- 只读。给它赋值抛 `TypeError`。
- 每次读得到一个新的 `CGPoint`，所以 `r.origin === r.origin` 是 `false`。
- `origin` 不出现在 `JSON.stringify` 的输出里，JSON 里只有 `x`、`y`、`width`、`height` 四个字段。
- 写入接受矩形的地方时，普通对象只认四个直接字段。`{ origin, size }` 这种形状不被接受，按「少字段」抛错，见[结构体](../structs.md#写入时可以给普通对象)。

## 示例

```js
const r = new CGRect(10, 20, 100, 50);
console.log(String(r.origin));
console.log(r.origin === r.origin);
```

**结果**：依次输出 `CGPoint(10, 20)`、`false`。

## 对应的 iOS API

`CGRect.origin`。ObjC 里只有嵌套的写法；这里两种都有：`rect.origin.x` 和 `rect.x` 读到的是同一个数。

## 参见

- [`x`](./x.md)、[`y`](./y.md)：直接读字段
- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
