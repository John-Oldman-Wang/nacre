---
type: reference
native: UICollectionViewListCell
status: partial
---

# `UICollectionViewListCell`

**`UICollectionViewListCell`** 表示列表布局里用的单元格。它知道列表的外观，能给出一份和外观配套的内容样式：[`defaultContentConfiguration()`](ui-collection-view-list-cell/defaultcontentconfiguration.md)。行高、分隔线、按下的高亮都是现成的。

用列表布局（[`UICollectionLayoutListConfiguration`](ui-collection-layout-list-configuration.md)）时登记这个类：`list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' })`。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UICollectionReusableView`](ui-collection-reusable-view.md) → [`UICollectionViewCell`](ui-collection-view-cell.md) → `UICollectionViewListCell`

## 构造函数

不能用 `new` 创建，`new UICollectionViewListCell()` 抛 `TypeError`。先用 [`registerClass()`](ui-collection-view/registerclass.md) 登记，再在 `cellProvider` 里取。

## 实例属性

都继承自 [`UICollectionViewCell`](ui-collection-view-cell.md)：`contentView`、`contentConfiguration`、`isSelected`、`isHighlighted`。

## 实例方法

| 方法 | 说明 |
| --- | --- |
| [`defaultContentConfiguration()`](ui-collection-view-list-cell/defaultcontentconfiguration.md) | 给一份和列表外观配套的内容配置，上面还没有内容 |

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
    content.text = '订单 ' + id;
    content.secondaryText = '已发货';
    cell.contentConfiguration = content;
    return cell;
  },
});
```

**效果**：每行上面是「订单」加标识，下面是灰色的「已发货」。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[cell defaultContentConfiguration]` | `cell.defaultContentConfiguration()` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 行右侧的箭头、对勾、删除按钮 | `accessories` |
| 缩进的层级 | `indentationLevel`、`indentationWidth` |

## 参见

- [`UICollectionViewCell`](ui-collection-view-cell.md)
- [`UIListContentConfiguration`](ui-list-content-configuration.md)
