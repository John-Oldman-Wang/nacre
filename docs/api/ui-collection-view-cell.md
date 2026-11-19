---
type: reference
native: UICollectionViewCell
status: partial
---

# `UICollectionViewCell`

**`UICollectionViewCell`** 表示单元格：[`UICollectionView`](ui-collection-view.md) 里一项在屏幕上的视图。

单元格不能用 `new` 建，只能在数据源的 `cellProvider` 里用 [`dequeueReusableCellWithReuseIdentifier()`](ui-collection-view/dequeuereusablecellwithreuseidentifier.md) 取。单元格是复用的：一项滚出屏幕之后，它的单元格会被拿去显示别的项。所以 `cellProvider` 每次都要把单元格上的内容整个设一遍，不能假设它是新的。

单元格上显示的内容有两种来源：[`contentConfiguration`](ui-collection-view-cell/contentconfiguration.md) 给出的主文字、副文字、图片，以及 App 自己加到 [`contentView`](ui-collection-view-cell/contentview.md) 上的子视图。

列表布局里用的是它的子类 [`UICollectionViewListCell`](ui-collection-view-list-cell.md)，它多一个给出默认内容样式的方法。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UICollectionReusableView`](ui-collection-reusable-view.md) → `UICollectionViewCell`

## 构造函数

不能用 `new` 创建，`new UICollectionViewCell()` 抛 `TypeError`。先用 [`registerClass()`](ui-collection-view/registerclass.md) 登记，再在 `cellProvider` 里取。

## 实例属性

还继承 [`UICollectionReusableView`](ui-collection-reusable-view.md) 和 [`UIView`](ui-view.md) 的属性，比如 `reuseIdentifier`。

| 属性 | 说明 |
| --- | --- |
| [`contentView`](ui-collection-view-cell/contentview.md) <small>只读</small> | 放自己的子视图的地方 |
| [`contentConfiguration`](ui-collection-view-cell/contentconfiguration.md) | 单元格的内容：主文字、副文字、图片 |
| [`isSelected`](ui-collection-view-cell/isselected.md) | 这一项是不是选中的 |
| [`isHighlighted`](ui-collection-view-cell/ishighlighted.md) | 手指是不是正按在这一项上 |

## 示例

### 在单元格里放一个自己的标签

单元格是复用的，所以只在它第一次用的时候建子视图，之后每次只改内容。

```js
/** @type {WeakMap<UICollectionViewCell, UILabel>} */
const priceLabels = new WeakMap();

/** @param {UICollectionViewCell} cell */
function priceLabelOf(cell) {
  let label = priceLabels.get(cell);
  if (label === undefined) {
    label = new UILabel();
    label.translatesAutoresizingMaskIntoConstraints = false;
    cell.contentView.addSubview(label);
    NSLayoutConstraint.activateConstraints([
      label.trailingAnchor.constraintEqualToAnchor(cell.contentView.trailingAnchor, { constant: -16 }),
      label.centerYAnchor.constraintEqualToAnchor(cell.contentView.centerYAnchor),
    ]);
    priceLabels.set(cell, label);
  }
  return label;
}
```

**效果**：在 `cellProvider` 里取到单元格之后调 `priceLabelOf(cell).text = '¥ 128'`，每行右侧多一个价格。屏幕上的样子**未在模拟器验证**；实测 `contentView` 里能加子视图，同一个单元格再次取到时是同一个 JS 对象。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `cell.contentView` | `cell.contentView` |
| `cell.contentConfiguration = content` | `cell.contentConfiguration = content` |
| `cell.selected` | `cell.isSelected` |
| `cell.highlighted` | `cell.isHighlighted` |

## 参见

- [`UICollectionViewListCell`](ui-collection-view-list-cell.md)
- [`UIListContentConfiguration`](ui-list-content-configuration.md)
- [单元格的登记和取用](ui-collection-view.md#单元格的登记和取用)
- [做一个列表](../guides/lists.md)
