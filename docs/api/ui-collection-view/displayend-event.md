---
type: reference
native: "UICollectionViewDelegate collectionView:didEndDisplayingCell:forItemAtIndexPath:"
---

# `UICollectionView`：`displayend` 事件

**`displayend`** 事件在一项的单元格离开屏幕之后派发。

## 语法

```
list.addEventListener('displayend', (event) => { })
```

## 事件对象

`UICollectionViewItemEvent`。`type` 是事件名，`target` 是这个列表，另外多一个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| `indexPath` | [`NSIndexPath`](../ns-index-path.md) | 事件发生那一刻这一项的位置 |

不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 一项滚出屏幕、被删掉时派发。
- 这时它的单元格可能已经被拿去显示别的项。
- 回调排在当前这一轮代码之后执行。回调执行前数据变了的话，`indexPath` 这个位置上可能已经是另一项，或者没有项。先用 [`itemIdentifierForIndexPath()`](../ui-collection-view-diffable-data-source/itemidentifierforindexpath.md) 换成标识，结果是 `null` 时这个位置上已经没有项。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.addEventListener('displayend', (event) => {
  console.log('离开了 ' + String(event.indexPath));
});
```

**效果**：一行滚出屏幕时，控制台输出它原来的位置。

## 对应的 iOS API

`UICollectionViewDelegate` 的 `collectionView:didEndDisplayingCell:forItemAtIndexPath:`。

## 参见

- [`beforedisplay`](beforedisplay-event.md)
