---
type: reference
native: "-[UICollectionView cellForItemAtIndexPath:]"
---

# `UICollectionView`：`cellForItemAtIndexPath()` 方法

**`cellForItemAtIndexPath()`** 方法返回某一项现在的单元格。

## 语法

```
cellForItemAtIndexPath(indexPath)
```

### 参数

**`indexPath`**

这一项的位置，[`NSIndexPath`](../ns-index-path.md) 或 `{ section, item }`。

### 返回值

[`UICollectionViewCell`](../ui-collection-view-cell.md)，或者 `null`。

- 给的就是 `cellProvider` 返回的那个对象（实测）。
- 这一项不在屏幕上，或者没有这一项，返回 `null`（实测）。

### 异常

无。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.cellForItemAtIndexPath({ section: 0, item: 0 }));
```

**结果**：没有数据时输出 `null`。

## 对应的 iOS API

`-[UICollectionView cellForItemAtIndexPath:]`。

## 参见

- [`indexPathForCell()`](indexpathforcell.md)
