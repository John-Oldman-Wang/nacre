---
type: reference
native: "-[UICollectionView indexPathForCell:]"
---

# `UICollectionView`：`indexPathForCell()` 方法

**`indexPathForCell()`** 方法返回一个单元格现在显示的是哪一项。

## 语法

```
indexPathForCell(cell)
```

### 参数

**`cell`**

一个单元格，[`UICollectionViewCell`](../ui-collection-view-cell.md)。

### 返回值

[`NSIndexPath`](../ns-index-path.md)，或者 `null`。单元格不在屏幕上返回 `null`。

### 异常

**`TypeError`**

`cell` 不是单元格（实测）。

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
list.addEventListener('beforedisplay', (event) => {
  const cell = list.cellForItemAtIndexPath(event.indexPath);
  if (cell !== null) console.log(String(list.indexPathForCell(cell)));
});
```

**效果**：一项即将出现时，输出它的位置，比如 `NSIndexPath(0, 0)`。**未在模拟器验证。**

## 对应的 iOS API

`-[UICollectionView indexPathForCell:]`。

## 参见

- [`cellForItemAtIndexPath()`](cellforitematindexpath.md)
