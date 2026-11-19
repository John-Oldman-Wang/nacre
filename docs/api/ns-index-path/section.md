---
type: reference
native: NSIndexPath.section
---

# `NSIndexPath`：`section` 属性

**`section`** 属性是第几个分区，从 0 数。

## 值

非负整数。

- 只读。给它赋值抛 `TypeError`。要别的位置就新建一个。

## 示例

```js
const path = new NSIndexPath(2, 5);
console.log(path.section);
```

**结果**：输出 `2`。

## 对应的 iOS API

`NSIndexPath.section`。

## 参见

- [`NSIndexPath`](../ns-index-path.md)
