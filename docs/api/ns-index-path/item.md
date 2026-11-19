---
type: reference
native: NSIndexPath.item
---

# `NSIndexPath`：`item` 属性

**`item`** 属性是分区里的第几项，从 0 数。

## 值

非负整数。

- 只读。给它赋值抛 `TypeError`。要别的位置就新建一个。

## 示例

```js
const path = new NSIndexPath(2, 5);
console.log(path.item);
```

**结果**：输出 `5`。

## 对应的 iOS API

`NSIndexPath.item`。

## 参见

- [`NSIndexPath`](../ns-index-path.md)
