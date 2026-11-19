---
type: reference
native: UICollectionView.collectionViewLayout
---

# `UICollectionView`：`collectionViewLayout` 属性

**`collectionViewLayout`** 属性是建列表时给的布局对象。

## 值

[`UICollectionViewLayout`](../ui-collection-view-layout.md)。

- 只读。给它赋值抛 `TypeError`。
- 读出来是建的时候给的那一个对象（实测）。

## 示例

```js
const layout = UICollectionViewCompositionalLayout.layoutWithListConfiguration(
  new UICollectionLayoutListConfiguration('plain'));
const list = new UICollectionView(layout);
console.log(list.collectionViewLayout === layout);
```

**结果**：输出 `true`。

## 对应的 iOS API

`UICollectionView.collectionViewLayout`。ObjC 里可以换布局（`setCollectionViewLayout:animated:`），这里不能。

## 参见

- [`UICollectionView()`](constructor.md)
