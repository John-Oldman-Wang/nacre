---
type: reference
native: "-[UICollectionViewDiffableDataSource sectionIdentifierForIndex:]"
---

# `UICollectionViewDiffableDataSource`：`sectionIdentifierForIndex()` 方法

**`sectionIdentifierForIndex()`** 方法返回第几个分区的标识。查的是列表现在的数据，也就是最后一次 `applySnapshot()` 交进去的那一份。

## 语法

```
sectionIdentifierForIndex(index)
```

### 参数

**`index`**

分区的序号，整数，从 0 数。

### 返回值

分区的标识，或者 `null`。没有这个分区返回 `null`（实测）。

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
console.log(source.sectionIdentifierForIndex(0), source.sectionIdentifierForIndex(5));
```

**结果**：输出 `main null`。

## 对应的 iOS API

`-[UICollectionViewDiffableDataSource sectionIdentifierForIndex:]`。

## 参见

- [分区和项](../ui-collection-view.md#分区和项)
