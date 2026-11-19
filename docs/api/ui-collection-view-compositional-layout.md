---
type: reference
native: UICollectionViewCompositionalLayout
status: partial
---

# `UICollectionViewCompositionalLayout`

**`UICollectionViewCompositionalLayout`** 表示组合布局：一种由分区、组、项拼成的布局对象。现在只能用它建列表布局：把一份 [`UICollectionLayoutListConfiguration`](ui-collection-layout-list-configuration.md) 交给 [`layoutWithListConfiguration()`](ui-collection-view-compositional-layout/layoutwithlistconfiguration.md)，得到的布局交给 [`new UICollectionView()`](ui-collection-view/constructor.md)。

**继承关系**：`EventTarget` → `NSObject` → [`UICollectionViewLayout`](ui-collection-view-layout.md) → `UICollectionViewCompositionalLayout`

## 构造函数

不能用 `new` 创建，`new UICollectionViewCompositionalLayout()` 抛 `TypeError`。用下面的静态方法。

## 静态方法

[`UICollectionViewCompositionalLayout.layoutWithListConfiguration()`](ui-collection-view-compositional-layout/layoutwithlistconfiguration.md)

用一份列表配置建一个列表布局。

## 示例

```js
const layout = UICollectionViewCompositionalLayout.layoutWithListConfiguration(
  new UICollectionLayoutListConfiguration('insetGrouped'));
const list = new UICollectionView(layout);
console.log(list.collectionViewLayout === layout);
```

**结果**：得到一个圆角卡片外观的列表。控制台输出 `true`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UICollectionViewCompositionalLayout layoutWithListConfiguration:config]` | `UICollectionViewCompositionalLayout.layoutWithListConfiguration(config)` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 网格、横向滚动的分区、每个分区不同的排法 | `initWithSection:`、`initWithSectionProvider:`、`NSCollectionLayoutSection` 一组 |

## 参见

- [`UICollectionLayoutListConfiguration`](ui-collection-layout-list-configuration.md)：列表的外观
- [`UICollectionView`](ui-collection-view.md)
