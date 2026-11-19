---
type: reference
native: "-[UICollectionView indexPathForItemAtPoint:]"
---

# `UICollectionView`：`indexPathForItemAtPoint()` 方法

**`indexPathForItemAtPoint()`** 方法返回列表坐标系里的一个点落在哪一项上。

## 语法

```
indexPathForItemAtPoint(point)
```

### 参数

**`point`**

一个点，[`CGPoint`](../structs.md) 或 `{ x, y }`，单位是 [pt](../units.md)，坐标系是列表自己的（包括滚动的偏移）。

### 返回值

[`NSIndexPath`](../ns-index-path.md)，或者 `null`。没落在任何一项上返回 `null`（实测）。

### 异常

**`TypeError`**

`point` 不是点。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.indexPathForItemAtPoint({ x: -50, y: -50 }));
```

**结果**：输出 `null`。

## 对应的 iOS API

`-[UICollectionView indexPathForItemAtPoint:]`。

## 参见

- [`cellForItemAtIndexPath()`](cellforitematindexpath.md)
