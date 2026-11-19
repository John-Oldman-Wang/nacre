---
type: reference
native: UICollectionView.visibleCells
---

# `UICollectionView`：`visibleCells` 属性

**`visibleCells`** 属性是现在在屏幕上的单元格。

## 值

[`UICollectionViewCell`](../ui-collection-view-cell.md) 的数组。

- 只读。给它赋值抛 `TypeError`。
- 默认是空数组。
- 每一个都是 `cellProvider` 返回过的那个对象（实测）。顺序不保证。
- 每次读得到一个新数组。
- 没有单独的变化事件。屏幕上有哪些项的变化用 [`beforedisplay`](beforedisplay-event.md) 和 [`displayend`](displayend-event.md) 得知。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.visibleCells.length);
```

**结果**：列表还没显示出来时输出 `0`。

## 对应的 iOS API

`UICollectionView.visibleCells`。

## 参见

- [`cellForItemAtIndexPath()`](cellforitematindexpath.md)
