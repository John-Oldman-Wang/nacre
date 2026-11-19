---
type: reference
native: UICollectionView.numberOfSections
---

# `UICollectionView`：`numberOfSections` 属性

**`numberOfSections`** 属性是列表现在有几个分区。

## 值

数，是个数。

- 只读。给它赋值抛 `TypeError`。
- 没接数据源时系统报 `1`（实测），那个分区里 0 项。
- 没有单独的变化事件。数据变了是因为 App 调了 `applySnapshot()`。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.numberOfSections, list.numberOfItemsInSection(0));
```

**结果**：输出 `1 0`。

## 对应的 iOS API

`UICollectionView.numberOfSections`。

## 参见

- [`numberOfItemsInSection()`](numberofitemsinsection.md)
