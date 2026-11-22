---
type: reference
native: "UICollectionViewDelegate collectionView:willDisplayCell:forItemAtIndexPath:"
---

# `UICollectionView`：`beforedisplay` 事件

**`beforedisplay`** 事件在一项的单元格即将出现在屏幕上时派发。

## 语法

```
list.addEventListener('beforedisplay', (event) => { })
```

## 事件对象

[`UICollectionViewItemEvent`](../ui-collection-view-item-event.md)。`type` 是事件名，`target` 是这个列表，另外多一个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`indexPath`](../ui-collection-view-item-event/indexpath.md) | [`NSIndexPath`](../ns-index-path.md) | 事件发生那一刻这一项的位置 |

不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 列表第一次显示和滚动时，每一项进入屏幕之前派发一次。
- 单元格从 [`cellForItemAtIndexPath()`](cellforitematindexpath.md) 取。
- 回调排在当前这一轮代码之后执行。回调执行前数据变了的话，`indexPath` 这个位置上可能已经是另一项，或者没有项。先用 [`itemIdentifierForIndexPath()`](../ui-collection-view-diffable-data-source/itemidentifierforindexpath.md) 换成标识，结果是 `null` 时这个位置上已经没有项。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.addEventListener('beforedisplay', (event) => {
  const last = list.numberOfItemsInSection(event.indexPath.section) - 1;
  if (event.indexPath.item >= last - 5) console.log('快到底了');
});
```

**效果**：滚到离末尾还有 5 行时，控制台输出 `快到底了`。加载下一页时要自己防止重复触发。

## 对应的 iOS API

`UICollectionViewDelegate` 的 `collectionView:willDisplayCell:forItemAtIndexPath:`。单元格参数去掉了，用 `cellForItemAtIndexPath()` 取。

## 参见

- [`displayend`](displayend-event.md)
- [快到底时加载更多](../../guides/lists.md#快到底时加载更多)
