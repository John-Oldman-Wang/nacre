---
type: reference
native: UICollectionViewItemEvent.indexPath
---

# `UICollectionViewItemEvent`：`indexPath` 属性

**`indexPath`** 属性是事件发生那一刻这一项的位置。

## 值

[`NSIndexPath`](../ns-index-path.md)：第几个分区的第几项。

- 只读。给它赋值抛 `TypeError`。
- 回调排在当前这一轮代码之后执行。这期间数据变了的话，这个位置上可能已经是另一项，或者没有项。先用 [`itemIdentifierForIndexPath()`](../ui-collection-view-diffable-data-source/itemidentifierforindexpath.md) 换成标识，结果是 `null` 时这个位置上已经没有项。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.addEventListener('itemselect', (e) => {
  console.log('第 ' + e.indexPath.section + ' 区第 ' + e.indexPath.item + ' 项');
  list.deselectItemAtIndexPath(e.indexPath, { animated: true });
});
```

**效果**：点列表里的一行，输出它的分区和位置，然后取消选中。

## 对应的 iOS API

`collectionView:didSelectItemAtIndexPath:` 这一组委托方法的参数 `indexPath`。

## 参见

- [`UICollectionViewItemEvent`](../ui-collection-view-item-event.md)
