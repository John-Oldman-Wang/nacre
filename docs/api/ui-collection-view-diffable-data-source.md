---
type: reference
native: UICollectionViewDiffableDataSource
status: partial
---

# `UICollectionViewDiffableDataSource`

**`UICollectionViewDiffableDataSource`** 表示一个列表的数据源：它决定 [`UICollectionView`](ui-collection-view.md) 显示哪些项、每一项长什么样。

数据源做两件事。一是保存列表现在的数据：一份[快照](ns-diffable-data-source-snapshot.md)，记着有哪些分区和项。二是在系统要显示某一项时调 App 给的 `cellProvider`，拿到这一项的单元格。App 改数据的方式是交一份新快照给 [`applySnapshot()`](ui-collection-view-diffable-data-source/applysnapshot.md)，系统比较前后两份，算出插入、删除、移动。

建好就接到列表上，`list.dataSource` 读出来是它。列表持有数据源，App 不用另外保存引用。

**继承关系**：`EventTarget` → `NSObject` → `UICollectionViewDiffableDataSource`

怎么用它增删改行，见指南[做一个列表](../guides/lists.md)。

## 构造函数

[`UICollectionViewDiffableDataSource()`](ui-collection-view-diffable-data-source/constructor.md)

建一个数据源，接到一个列表上，并给出 `cellProvider`。

## 实例方法

数据：

| 方法 | 说明 |
| --- | --- |
| [`snapshot()`](ui-collection-view-diffable-data-source/snapshot.md) | 列表现在的数据的一份副本 |
| [`applySnapshot()`](ui-collection-view-diffable-data-source/applysnapshot.md) | 让列表显示一份快照，差异可以带动画 |
| [`applySnapshotUsingReloadData()`](ui-collection-view-diffable-data-source/applysnapshotusingreloaddata.md) | 让列表显示一份快照，整个重新加载 |

位置和标识互换：

| 方法 | 说明 |
| --- | --- |
| [`itemIdentifierForIndexPath()`](ui-collection-view-diffable-data-source/itemidentifierforindexpath.md) | 某个位置上是哪一项 |
| [`indexPathForItemIdentifier()`](ui-collection-view-diffable-data-source/indexpathforitemidentifier.md) | 一项现在在哪个位置 |
| [`sectionIdentifierForIndex()`](ui-collection-view-diffable-data-source/sectionidentifierforindex.md) | 第几个分区的标识 |
| [`indexForSectionIdentifier()`](ui-collection-view-diffable-data-source/indexforsectionidentifier.md) | 一个分区排第几 |

## `cellProvider` 是当场执行的

系统要显示一项时调 `cellProvider`，等它返回单元格。它执行期间界面不动。

- 只在里面做两件事：取单元格，设内容。不要在里面发请求或做大量计算。
- 它抛出异常或者没有返回单元格时，App 不会崩。异常从 [`application` 的 `error` 事件](application.md)报出来，这一项显示成空白。
- 取单元格的规则见[单元格的登记和取用](ui-collection-view.md#单元格的登记和取用)。

## 示例

### 建数据源，放三项

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });

const titles = new Map([['a', '苹果'], ['b', '香蕉'], ['c', '樱桃']]);
const source = new UICollectionViewDiffableDataSource(list, {
  cellProvider(collectionView, indexPath, id) {
    const cell = collectionView.dequeueReusableCellWithReuseIdentifier('row', { forIndexPath: indexPath });
    const content = cell.defaultContentConfiguration();
    content.text = titles.get(String(id)) ?? '';
    cell.contentConfiguration = content;
    return cell;
  },
});

const snapshot = new NSDiffableDataSourceSnapshot();
snapshot.appendSectionsWithIdentifiers(['main']);
snapshot.appendItemsWithIdentifiers(['a', 'b', 'c']);
source.applySnapshot(snapshot, { animatingDifferences: false });
console.log(list.dataSource === source);
```

**效果**：列表显示「苹果」「香蕉」「樱桃」三行。控制台输出 `true`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UICollectionViewDiffableDataSource alloc] initWithCollectionView:list cellProvider:^(…) { … }]` | `new UICollectionViewDiffableDataSource(list, { cellProvider(…) { … } })` |
| `[source applySnapshot:snapshot animatingDifferences:YES completion:^{ … }]` | `await source.applySnapshot(snapshot, { animatingDifferences: true })` |
| `[source applySnapshotUsingReloadData:snapshot completion:^{ … }]` | `await source.applySnapshotUsingReloadData(snapshot)` |
| `[source snapshot]` | `source.snapshot()` |

`completion:` 参数换成了返回的 Promise。`NSNotFound` 换成了 -1。

## 参见

- [`UICollectionView`](ui-collection-view.md)
- [`NSDiffableDataSourceSnapshot`](ns-diffable-data-source-snapshot.md)
- [做一个列表](../guides/lists.md)
