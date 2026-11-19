---
type: reference
native: UICollectionViewCell.contentView
---

# `UICollectionViewCell`：`contentView` 属性

**`contentView`** 属性是单元格里放自己的子视图的地方。

## 值

[`UIView`](../ui-view.md)。

- 只读。给它赋值抛 `TypeError`。
- 每次读是同一个对象（实测）。
- 子视图加在它上面，不要直接加在单元格上。实测 `contentView` 里能加子视图。
- 单元格是复用的：只在第一次用这个单元格时建子视图，之后每次只改内容。同一个单元格再次取到时是同一个 JS 对象（实测），可以用 `WeakMap` 记住它上面的子视图。
- [`contentConfiguration`](contentconfiguration.md) 写 `null` 时，`contentView` 里只有自己加的子视图。

## 示例

```js
/** @param {UICollectionViewListCell} cell */
function inspect(cell) {
  const badge = new UILabel();
  badge.text = 'NEW';
  badge.translatesAutoresizingMaskIntoConstraints = false;
  cell.contentView.addSubview(badge);
  badge.trailingAnchor.constraintEqualToAnchor(cell.contentView.trailingAnchor, { constant: -16 }).isActive = true;
  badge.centerYAnchor.constraintEqualToAnchor(cell.contentView.centerYAnchor).isActive = true;
}
```

**效果**：对一个单元格调 `inspect(cell)` 之后，这一行右侧显示「NEW」。屏幕上的样子**未在模拟器验证**。

## 对应的 iOS API

`UICollectionViewCell.contentView`。

## 参见

- [在单元格里放自己的视图](../../guides/lists.md#在单元格里放自己的视图)
