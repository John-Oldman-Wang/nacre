---
type: reference
native: UICollectionReusableView.reuseIdentifier
---

# `UICollectionReusableView`：`reuseIdentifier` 属性

**`reuseIdentifier`** 属性是取出这个视图时用的复用标识。

## 值

字符串，或者 `null`。

- 只读。给它赋值抛 `TypeError`。
- 单元格的这个值是 `registerClass()` 和 `dequeueReusableCellWithReuseIdentifier()` 时给的那个复用标识（实测）。

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
  if (cell !== null) console.log(cell.reuseIdentifier);
});
```

**效果**：每一项出现时输出 `row`。

## 对应的 iOS API

`UICollectionReusableView.reuseIdentifier`。

## 参见

- [`registerClass()`](../ui-collection-view/registerclass.md)
