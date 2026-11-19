---
type: reference
native: "-[UICollectionView scrollToItemAtIndexPath:atScrollPosition:animated:]"
---

# `UICollectionView`：`scrollToItemAtIndexPath()` 方法

**`scrollToItemAtIndexPath()`** 方法滚动列表，让某一项停在可见区域的指定位置。

## 语法

```
scrollToItemAtIndexPath(indexPath, { atScrollPosition })
scrollToItemAtIndexPath(indexPath, { atScrollPosition, animated })
```

### 参数

**`indexPath`**

这一项的位置，[`NSIndexPath`](../ns-index-path.md) 或 `{ section, item }`。

**`options.atScrollPosition`**

字符串的数组，必填。把这一项停在哪里：

| 取值 | 效果 |
| --- | --- |
| `'top'` | 这一项的顶边对齐可见区域的顶边 |
| `'centeredVertically'` | 这一项在可见区域的垂直中间 |
| `'bottom'` | 这一项的底边对齐可见区域的底边 |
| `'left'`、`'centeredHorizontally'`、`'right'` | 横向滚动的列表用，含义同上 |

纵向三个里最多写一个，横向三个里最多写一个。

**`options.animated`**

布尔，可以不传。默认 `false`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 位置上没有项：`scrollToItemAtIndexPath: there is no item at section 1, item 99`
- 没给 `atScrollPosition`：`scrollToItemAtIndexPath needs { atScrollPosition }`
- 滚动位置写了不认识的名字：`atScrollPosition has no value "middle"; expected one of: …`

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
const where = source.indexPathForItemIdentifier('A1003');
if (where !== null) {
  list.scrollToItemAtIndexPath(where, { atScrollPosition: ['centeredVertically'], animated: true });
}
```

**效果**：列表滚动，让「A1003」那一行停在可见区域的中间。

## 对应的 iOS API

`-[UICollectionView scrollToItemAtIndexPath:atScrollPosition:animated:]`。`UICollectionViewScrollPositionTop` 写成 `['top']`。

## 参见

- [`UICollectionViewDiffableDataSource` 的 `indexPathForItemIdentifier()`](../ui-collection-view-diffable-data-source/indexpathforitemidentifier.md)
