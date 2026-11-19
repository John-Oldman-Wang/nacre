---
type: reference
native: "-[UICollectionView numberOfItemsInSection:]"
---

# `UICollectionView`：`numberOfItemsInSection()` 方法

**`numberOfItemsInSection()`** 方法返回第 `section` 个分区里有几项。

## 语法

```
numberOfItemsInSection(section)
```

### 参数

**`section`**

分区的序号，整数，从 0 数。

### 返回值

数，是个数。

### 异常

**`TypeError`**

没有这个分区：`numberOfItemsInSection: there is no section 3`

## 示例

```js
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(
    new UICollectionLayoutListConfiguration('insetGrouped')));
console.log(list.numberOfItemsInSection(0));
```

**结果**：没接数据源时输出 `0`。

## 对应的 iOS API

`-[UICollectionView numberOfItemsInSection:]`。

## 参见

- [`numberOfSections`](numberofsections.md)
- [快到底时加载更多](../../guides/lists.md#快到底时加载更多)
