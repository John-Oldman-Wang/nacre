---
type: reference
native: UICollectionViewLayout
---

# `UICollectionViewLayout`

**`UICollectionViewLayout`** 表示决定 [`UICollectionView`](ui-collection-view.md) 里单元格怎么排的对象。它是布局对象的基类，[`UICollectionView()`](ui-collection-view/constructor.md) 要的参数和 [`collectionViewLayout`](ui-collection-view/collectionviewlayout.md) 读出来的都是这个类型。

它自己没有成员。现在能用的布局只有 [`UICollectionViewCompositionalLayout`](ui-collection-view-compositional-layout.md) 建出来的列表布局。

**继承关系**：`EventTarget` → `NSObject` → `UICollectionViewLayout`

## 构造函数

不能用 `new` 创建，`new UICollectionViewLayout()` 抛 `TypeError`。用 [`UICollectionViewCompositionalLayout.layoutWithListConfiguration()`](ui-collection-view-compositional-layout/layoutwithlistconfiguration.md) 建布局。

## 对应的 iOS API

`UICollectionViewLayout`。ObjC 里通过继承它自定义布局；JS 里原生类不能继承，见[原生类](native-classes.md)。

## 参见

- [`UICollectionViewCompositionalLayout`](ui-collection-view-compositional-layout.md)
- [`UICollectionView`](ui-collection-view.md)
