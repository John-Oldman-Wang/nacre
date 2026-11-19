---
type: reference
native: UICollectionLayoutListConfiguration
status: partial
---

# `UICollectionLayoutListConfiguration`

**`UICollectionLayoutListConfiguration`** 表示列表布局的配置：列表的外观、行之间画不画分隔线、底色、分区的头从哪来。

它只是一份数据。交给 [`UICollectionViewCompositionalLayout.layoutWithListConfiguration()`](ui-collection-view-compositional-layout/layoutwithlistconfiguration.md) 的那一刻，配置被复制进布局。之后再改它，已经建好的列表不变。

**继承关系**：`EventTarget` → `NSObject` → `UICollectionLayoutListConfiguration`

## 构造函数

[`UICollectionLayoutListConfiguration()`](ui-collection-layout-list-configuration/constructor.md)

用一种外观创建配置。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`appearance`](ui-collection-layout-list-configuration/appearance.md) <small>只读</small> | 建的时候给的外观 |
| [`showsSeparators`](ui-collection-layout-list-configuration/showsseparators.md) | 行之间画不画分隔线 |
| [`backgroundColor`](ui-collection-layout-list-configuration/backgroundcolor.md) | 列表的底色 |
| [`headerMode`](ui-collection-layout-list-configuration/headermode.md) | 分区的头从哪来 |

## 示例

```js
const config = new UICollectionLayoutListConfiguration('plain');
config.showsSeparators = false;
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(config));
```

**效果**：每行通栏、没有分隔线的列表。屏幕上的样子**未在模拟器验证**。

> **注意**：配置在 `layoutWithListConfiguration()` 的那一刻被复制进布局。之后再改 `config`，已经建好的列表不变。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UICollectionLayoutListConfiguration alloc] initWithAppearance:UICollectionLayoutListAppearanceInsetGrouped]` | `new UICollectionLayoutListConfiguration('insetGrouped')` |
| `config.showsSeparators = NO` | `config.showsSeparators = false` |
| `config.headerMode = UICollectionLayoutListHeaderModeFirstItemInSection` | `config.headerMode = 'firstItemInSection'` |

## 参见

- [`UICollectionViewCompositionalLayout`](ui-collection-view-compositional-layout.md)
- [做一个列表](../guides/lists.md)
