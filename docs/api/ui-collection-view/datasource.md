---
type: reference
native: UICollectionView.dataSource
---

# `UICollectionView`：`dataSource` 属性

**`dataSource`** 属性是接在列表上的数据源。

## 值

[`UICollectionViewDiffableDataSource`](../ui-collection-view-diffable-data-source.md)，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 还没接数据源时是 `null`。
- 建数据源时自动接上：`new UICollectionViewDiffableDataSource(list, …)` 之后，`list.dataSource` 读出来是它。
- 列表持有数据源，App 不用另外保存引用。

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
console.log(list.dataSource === source);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UICollectionView.dataSource`。ObjC 里赋值接上；这里在建数据源时自动接上。

## 参见

- [`UICollectionViewDiffableDataSource()`](../ui-collection-view-diffable-data-source/constructor.md)
