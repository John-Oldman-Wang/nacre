---
type: reference
native: "+[NSIndexPath indexPathForItem:inSection:]"
---

# `NSIndexPath()` 构造函数

**`NSIndexPath()`** 构造函数用分区和项的序号创建一个位置。参数顺序是先分区后项。

## 语法

```
new NSIndexPath(section, item)
```

### 参数

**`section`**

第几个分区，从 0 数。

**`item`**

分区里的第几项，从 0 数。

两个数都是非负整数。小数向零取整，像数的字符串按数转（实测）。

### 返回值

新建的 `NSIndexPath`。

### 异常

**`TypeError`**

负数，或者转不成数的值（实测）。

## 示例

```js
const path = new NSIndexPath(1.9, 2.9);
console.log(String(path));
```

**结果**：输出 `NSIndexPath(1, 2)`。

## 对应的 iOS API

`[NSIndexPath indexPathForItem:item inSection:section]`。参数顺序和 ObjC 相反：这里先分区后项。

## 参见

- [`NSIndexPath.indexPathForItem()`](indexpathforitem.md)
