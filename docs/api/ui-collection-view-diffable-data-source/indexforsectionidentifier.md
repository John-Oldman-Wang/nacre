---
type: reference
native: "-[UICollectionViewDiffableDataSource indexForSectionIdentifier:]"
---

# `UICollectionViewDiffableDataSource`：`indexForSectionIdentifier()` 方法

**`indexForSectionIdentifier()`** 方法返回一个分区排第几。查的是列表现在的数据，也就是最后一次 `applySnapshot()` 交进去的那一份。

## 语法

```
indexForSectionIdentifier(sectionIdentifier)
```

### 参数

**`sectionIdentifier`**

分区的标识，字符串或整数。

### 返回值

数，从 0 数。没有这个分区返回 `-1`。

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
console.log(source.indexForSectionIdentifier('main'), source.indexForSectionIdentifier('nope'));
```

**结果**：输出 `0 -1`。

## 对应的 iOS API

`-[UICollectionViewDiffableDataSource indexForSectionIdentifier:]`。`NSNotFound` 换成了 -1。

## 参见

- [分区和项](../ui-collection-view.md#分区和项)
