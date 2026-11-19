---
type: reference
native: "-[UICollectionView registerClass:forCellWithReuseIdentifier:]"
---

# `UICollectionView`：`registerClass()` 方法

**`registerClass()`** 方法登记一种单元格，给它一个复用标识。之后在 `cellProvider` 里按这个复用标识取。

## 语法

```
registerClass(cellClass, { forCellWithReuseIdentifier })
```

### 参数

**`cellClass`**

单元格的类本身：[`UICollectionViewCell`](../ui-collection-view-cell.md) 或 [`UICollectionViewListCell`](../ui-collection-view-list-cell.md)。列表布局用 `UICollectionViewListCell`。

**`options.forCellWithReuseIdentifier`**

复用标识，非空字符串，必填。复用标识表示「哪一种单元格」，和项的标识是两回事。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- `cellClass` 不是单元格的类（比如 `UIView`，或者一个字符串）：`registerClass needs UICollectionViewCell or a subclass of it`
- 没给复用标识：`registerClass needs { forCellWithReuseIdentifier }`
- 复用标识是空串：`registerClass needs a non-empty forCellWithReuseIdentifier`

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
list.registerClass(UICollectionViewListCell, { forCellWithReuseIdentifier: 'row' });
```

**效果**：之后在 `cellProvider` 里可以用 `'row'` 取 `UICollectionViewListCell`。

## 对应的 iOS API

`-[UICollectionView registerClass:forCellWithReuseIdentifier:]`。ObjC 写 `UICollectionViewListCell.class`，JS 直接写类名。

## 参见

- [`dequeueReusableCellWithReuseIdentifier()`](dequeuereusablecellwithreuseidentifier.md)
- [单元格的登记和取用](../ui-collection-view.md#单元格的登记和取用)
