---
type: reference
native: "-[UICollectionView selectItemAtIndexPath:animated:scrollPosition:]"
---

# `UICollectionView`：`selectItemAtIndexPath()` 方法

**`selectItemAtIndexPath()`** 方法用代码选中一项。

## 语法

```
selectItemAtIndexPath(indexPath)
selectItemAtIndexPath(indexPath, { animated, scrollPosition })
```

### 参数

**`indexPath`**

这一项的位置，[`NSIndexPath`](../ns-index-path.md) 或 `{ section, item }`。给 `null` 是取消全部选中。

**`options.animated`**

布尔，可以不传。默认 `false`。

**`options.scrollPosition`**

字符串的数组，可以不传。选中之后把这一项滚到哪里。默认空数组，表示不滚动。

| 取值 | 效果 |
| --- | --- |
| `'top'` | 这一项的顶边对齐可见区域的顶边 |
| `'centeredVertically'` | 这一项在可见区域的垂直中间 |
| `'bottom'` | 这一项的底边对齐可见区域的底边 |
| `'left'`、`'centeredHorizontally'`、`'right'` | 横向滚动的列表用，含义同上 |

纵向三个里最多写一个，横向三个里最多写一个。

### 返回值

无（`undefined`）。

不派发 [`itemselect`](itemselect-event.md)（实测）。

### 异常

**`TypeError`**

- 位置上没有项：`selectItemAtIndexPath: there is no item at section 0, item 99`
- `indexPath` 不是位置（比如字符串）。
- `scrollPosition` 里有不认识的名字：`scrollPosition has no value "middle"; expected one of: …`

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
list.selectItemAtIndexPath({ section: 0, item: 1 }, { scrollPosition: ['centeredVertically'] });
console.log(list.indexPathsForSelectedItems.length);
```

**效果**：第二行变成选中的样子，并滚到可见区域的中间。控制台输出 `1`。

## 对应的 iOS API

`-[UICollectionView selectItemAtIndexPath:animated:scrollPosition:]`。`UICollectionViewScrollPosition` 位掩码写成字符串数组。

## 参见

- [`deselectItemAtIndexPath()`](deselectitematindexpath.md)
