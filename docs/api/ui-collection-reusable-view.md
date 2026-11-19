---
type: reference
native: UICollectionReusableView
---

# `UICollectionReusableView`

**`UICollectionReusableView`** 表示 [`UICollectionView`](ui-collection-view.md) 里能复用的视图。它是单元格 [`UICollectionViewCell`](ui-collection-view-cell.md) 的基类。

能复用的意思是：一项滚出屏幕后，它的视图不销毁，留着显示别的项。列表用复用标识区分不同种类的视图。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UICollectionReusableView`

## 构造函数

不能用 `new` 创建，`new UICollectionReusableView()` 抛 `TypeError`。单元格在数据源的 `cellProvider` 里用 [`dequeueReusableCellWithReuseIdentifier()`](ui-collection-view/dequeuereusablecellwithreuseidentifier.md) 取。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。

| 属性 | 说明 |
| --- | --- |
| [`reuseIdentifier`](ui-collection-reusable-view/reuseidentifier.md) <small>只读</small> | 取出它时用的复用标识 |

## 对应的 iOS API

`UICollectionReusableView`。ObjC 里通过继承它做分区头尾的补充视图；JS 里原生类不能继承，补充视图还不能用。

## 参见

- [`UICollectionViewCell`](ui-collection-view-cell.md)
- [单元格的登记和取用](ui-collection-view.md#单元格的登记和取用)
