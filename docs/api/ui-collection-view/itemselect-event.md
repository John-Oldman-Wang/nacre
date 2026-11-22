---
type: reference
native: "UICollectionViewDelegate collectionView:didSelectItemAtIndexPath:"
---

# `UICollectionView`：`itemselect` 事件

**`itemselect`** 事件在用户点选了一项时派发。

## 语法

```
list.addEventListener('itemselect', (event) => { })
```

## 事件对象

[`UICollectionViewItemEvent`](../ui-collection-view-item-event.md)。`type` 是事件名，`target` 是这个列表，另外多一个只读字段：

| 字段 | 类型 | 含义 |
| --- | --- | --- |
| [`indexPath`](../ui-collection-view-item-event/indexpath.md) | [`NSIndexPath`](../ns-index-path.md) | 事件发生那一刻这一项的位置 |

不能取消，`preventDefault()` 不起作用。

## 什么时候派发

- 用户点一行时派发。**未在模拟器验证**：点选只有真实触摸能触发。
- [`allowsSelection`](allowsselection.md) 是 `false` 时不派发。
- 用代码调 [`selectItemAtIndexPath()`](selectitematindexpath.md) 不派发（实测）。
- 回调排在当前这一轮代码之后执行。回调执行前数据变了的话，`indexPath` 这个位置上可能已经是另一项，或者没有项。先用 [`itemIdentifierForIndexPath()`](../ui-collection-view-diffable-data-source/itemidentifierforindexpath.md) 换成标识，结果是 `null` 时这个位置上已经没有项。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });
const source = new UICollectionViewDiffableDataSource(list, {
  cellProvider(collectionView, indexPath, id) {
    const cell = collectionView.dequeueReusableCellWithReuseIdentifier('row', { forIndexPath: indexPath });
    const content = cell.defaultContentConfiguration();
    content.text = String(id);
    cell.contentConfiguration = content;
    return cell;
  },
});
list.addEventListener('itemselect', (event) => {
  const id = source.itemIdentifierForIndexPath(event.indexPath);
  if (id === null) return;
  console.log('点了 ' + id);
  list.deselectItemAtIndexPath(event.indexPath, { animated: true });
});
```

**效果**：点一行，控制台输出这一行的标识，这一行的高亮淡出。**未在模拟器验证。**

## 对应的 iOS API

`UICollectionViewDelegate` 的 `collectionView:didSelectItemAtIndexPath:`。

## 参见

- [`itemdeselect`](itemdeselect-event.md)
