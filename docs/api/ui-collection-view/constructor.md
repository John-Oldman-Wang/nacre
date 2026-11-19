---
type: reference
native: "-[UICollectionView initWithFrame:collectionViewLayout:]"
---

# `UICollectionView()` 构造函数

**`UICollectionView()`** 构造函数用一个布局对象创建列表。

## 语法

```
new UICollectionView(layout)
```

### 参数

**`layout`**

布局对象，[`UICollectionViewLayout`](../ui-collection-view-layout.md)。现在只能用 [`UICollectionViewCompositionalLayout.layoutWithListConfiguration()`](../ui-collection-view-compositional-layout/layoutwithlistconfiguration.md) 建。

### 返回值

新建的 `UICollectionView`。`frame` 是 0 × 0，用约束或 `frame` 给它位置和大小。还没有数据源，[`dataSource`](datasource.md) 是 `null`。

### 异常

**`TypeError`**

- `layout` 不是布局对象，或者没给。
- `UICollectionView` 不能被继承，`class X extends UICollectionView {}` 在 `new X()` 时抛，见[原生类](../native-classes.md#不能继承)。

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list instanceof UIScrollView, list.dataSource);
```

**结果**：输出 `true null`。

## 对应的 iOS API

`[[UICollectionView alloc] initWithFrame:CGRectZero collectionViewLayout:layout]`。`frame` 参数去掉了，用约束或 `frame` 属性定位。

## 参见

- [`UICollectionLayoutListConfiguration`](../ui-collection-layout-list-configuration.md)：列表的外观
