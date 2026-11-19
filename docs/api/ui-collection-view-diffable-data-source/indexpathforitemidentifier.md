---
type: reference
native: "-[UICollectionViewDiffableDataSource indexPathForItemIdentifier:]"
---

# `UICollectionViewDiffableDataSource`：`indexPathForItemIdentifier()` 方法

**`indexPathForItemIdentifier()`** 方法返回一项现在在哪个位置。查的是列表现在的数据，也就是最后一次 `applySnapshot()` 交进去的那一份。

## 语法

```
indexPathForItemIdentifier(itemIdentifier)
```

### 参数

**`itemIdentifier`**

项的标识，字符串或整数。

### 返回值

[`NSIndexPath`](../ns-index-path.md)，或者 `null`。没有这一项返回 `null`（实测）。

### 异常

无。

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
const first = new NSDiffableDataSourceSnapshot();
first.appendSectionsWithIdentifiers(['main']);
first.appendItemsWithIdentifiers(['A1001', 'A1002', 'A1003']);
await source.applySnapshot(first, { animatingDifferences: false });
console.log(String(source.indexPathForItemIdentifier('A1003')), source.indexPathForItemIdentifier('nope'));
```

**结果**：输出 `NSIndexPath(0, 2) null`。

## 对应的 iOS API

`-[UICollectionViewDiffableDataSource indexPathForItemIdentifier:]`。

## 参见

- [分区和项](../ui-collection-view.md#分区和项)
