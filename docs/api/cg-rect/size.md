---
type: reference
native: CGRect.size
---

# `CGRect`：`size` 属性

**`size`** 属性是矩形的尺寸，类型是 [`CGSize`](../cg-size.md)。它和矩形的 `width`、`height` 字段是同一组数。

## 值

[`CGSize`](../cg-size.md)，等于 `(width, height)`。

- 只读。给它赋值抛 `TypeError`。
- 每次读得到一个新的 `CGSize`，所以 `r.size === r.size` 是 `false`。
- `size` 不出现在 `JSON.stringify` 的输出里，JSON 里只有 `x`、`y`、`width`、`height` 四个字段。
- 写入接受矩形的地方时，普通对象只认四个直接字段。`{ origin, size }` 这种形状不被接受，按「少字段」抛错，见[结构体](../structs.md#写入时可以给普通对象)。

## 示例

```js
const r = new CGRect(10, 20, 100, 50);
console.log(String(r.size));
console.log(r.size === r.size);
```

**结果**：依次输出 `CGSize(100, 50)`、`false`。

## 对应的 iOS API

`CGRect.size`。ObjC 里只有嵌套的写法；这里两种都有：`rect.size.width` 和 `rect.width` 读到的是同一个数。

## 参见

- [`width`](./width.md)、[`height`](./height.md)：直接读字段
- [结构体](../structs.md)：所有结构体共同的规则：字段只读、写入时可以给普通对象、读出来是新对象
