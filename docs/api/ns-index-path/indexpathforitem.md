---
type: reference
native: "+[NSIndexPath indexPathForItem:inSection:]"
---

# `NSIndexPath.indexPathForItem()` 静态方法

**`NSIndexPath.indexPathForItem()`** 静态方法创建一个位置。参数顺序和 ObjC 的写法一样，先项后分区。结果和 `new NSIndexPath(section, item)` 相同。

## 语法

```
NSIndexPath.indexPathForItem(item, { inSection })
```

### 参数

**`item`**

分区里的第几项，从 0 数。

**`options.inSection`**

第几个分区，从 0 数，必填。

### 返回值

新建的 [`NSIndexPath`](../ns-index-path.md)。

### 异常

**`TypeError`**

- 没给 `inSection`（实测）。
- 负数，或者转不成数的值。

## 示例

```js
const path = NSIndexPath.indexPathForItem(7, { inSection: 1 });
console.log(path.section, path.item);
```

**结果**：输出 `1 7`。

## 对应的 iOS API

`+[NSIndexPath indexPathForItem:inSection:]`。

## 参见

- [`NSIndexPath()`](constructor.md)
