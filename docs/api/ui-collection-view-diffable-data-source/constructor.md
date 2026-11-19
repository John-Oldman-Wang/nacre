---
type: reference
native: "-[UICollectionViewDiffableDataSource initWithCollectionView:cellProvider:]"
---

# `UICollectionViewDiffableDataSource()` 构造函数

**`UICollectionViewDiffableDataSource()`** 构造函数建一个数据源，接到一个列表上，并给出系统要显示一项时调用的 `cellProvider`。

## 语法

```
new UICollectionViewDiffableDataSource(collectionView, { cellProvider })
```

### 参数

**`collectionView`**

要接的列表，[`UICollectionView`](../ui-collection-view.md)。

**`options.cellProvider`**

函数，必填。系统要显示一项时调它：`cellProvider(collectionView, indexPath, itemIdentifier)`。三个参数是这个列表、这一项的位置（[`NSIndexPath`](../ns-index-path.md)）、这一项的[标识](../ui-collection-view.md#标识)。它必须返回一个单元格，用 [`dequeueReusableCellWithReuseIdentifier()`](../ui-collection-view/dequeuereusablecellwithreuseidentifier.md) 取。

- 它是当场执行的：系统等它返回，执行期间界面不动。只在里面取单元格、设内容。
- 它只为屏幕上放得下的那几行调，不是每一项都调（实测）。
- 它抛出异常时 App 不会崩：异常从 [`application` 的 `error` 事件](../application.md)报出来，这一项显示成空白。
- 它返回的不是单元格时，`error` 事件报 `TypeError: cellProvider must return a UICollectionViewCell, got undefined`，这一项显示成空白。

### 返回值

新建的数据源，已经接到 `collectionView` 上：`collectionView.dataSource` 读出来是它。列表持有数据源，不用另外保存引用。

### 异常

**`TypeError`**

- 第一个参数不是列表：`UICollectionViewDiffableDataSource needs a UICollectionView`
- `cellProvider` 不是函数，或者没给 options：`UICollectionViewDiffableDataSource: cellProvider must be a function`

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

`-[UICollectionViewDiffableDataSource initWithCollectionView:cellProvider:]`。ObjC 的 block 写成 options 对象里的函数。

## 参见

- [单元格的登记和取用](../ui-collection-view.md#单元格的登记和取用)
