---
type: reference
native: NSIndexPath.row
---

# `NSIndexPath`：`row` 属性

**`row`** 属性和 [`item`](item.md) 是同一个数。Apple 的表格文档里叫 row。

## 值

非负整数。

- 只读。给它赋值抛 `TypeError`。要别的位置就新建一个。

## 示例

```js
const path = new NSIndexPath(2, 5);
console.log(path.row);
```

**结果**：输出 `5`。

## 对应的 iOS API

`NSIndexPath.row`。

## 参见

- [`NSIndexPath`](../ns-index-path.md)
