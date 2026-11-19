---
type: reference
native: UICollectionView.indexPathsForSelectedItems
---

# `UICollectionView`：`indexPathsForSelectedItems` 属性

**`indexPathsForSelectedItems`** 属性是选中的各项的位置。

## 值

[`NSIndexPath`](../ns-index-path.md) 的数组。

- 只读。给它赋值抛 `TypeError`。
- 默认是空数组。
- 没有选中的是空数组。
- 每次读得到一个新数组。
- 没有单独的变化事件。选中的变化用 [`itemselect`](itemselect-event.md) 和 [`itemdeselect`](itemdeselect-event.md) 得知。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.indexPathsForSelectedItems.length);
```

**结果**：没有选中时输出 `0`。

## 对应的 iOS API

`UICollectionView.indexPathsForSelectedItems`。

## 参见

- [`cellForItemAtIndexPath()`](cellforitematindexpath.md)
