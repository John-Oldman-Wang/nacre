---
type: reference
native: "-[UICollectionView dequeueReusableCellWithReuseIdentifier:forIndexPath:]"
---

# `UICollectionView`：`dequeueReusableCellWithReuseIdentifier()` 方法

**`dequeueReusableCellWithReuseIdentifier()`** 方法在数据源的 `cellProvider` 里取一个单元格，用来显示 `forIndexPath` 这一项。有能复用的就给复用的，没有就新建。

## 语法

```
dequeueReusableCellWithReuseIdentifier(identifier, { forIndexPath })
```

### 参数

**`identifier`**

登记时给的复用标识，字符串。

**`options.forIndexPath`**

这一项的位置。必须是 `cellProvider` 收到的那个 `indexPath`。

### 返回值

单元格，是登记时给的那个类。类型定义里默认当成 [`UICollectionViewListCell`](../ui-collection-view-list-cell.md)；登记的是 `UICollectionViewCell` 时，它上面没有 `defaultContentConfiguration()`。

单元格是复用的：拿到的可能是新的，也可能上面还留着另一项的内容。所以每次都把内容整个设一遍。

### 异常

**`TypeError`**

- 不在 `cellProvider` 里调：`dequeueReusableCellWithReuseIdentifier can only be called inside the cellProvider of this collection view's data source`
- 复用标识没登记过：`dequeueReusableCellWithReuseIdentifier: no cell class is registered for the reuse identifier "x"; call registerClass first`。在 `cellProvider` 里抛的这个异常能用 `try` 接住（实测）。
- 一次 `cellProvider` 里取了第二个。
- `forIndexPath` 不是 `cellProvider` 收到的那个位置。

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
source.applySnapshot(first, { animatingDifferences: false });
```

**效果**：列表显示三行，每行的主文字是它的标识。

## 对应的 iOS API

`-[UICollectionView dequeueReusableCellWithReuseIdentifier:forIndexPath:]`。ObjC 里在 `cellProvider` 之外调会让 App 崩溃，这里抛可以 `catch` 的 `TypeError`。

## 参见

- [`registerClass()`](registerclass.md)
- [`UICollectionViewDiffableDataSource()`](../ui-collection-view-diffable-data-source/constructor.md)：`cellProvider`
