---
type: reference
native: "+[UICollectionViewCompositionalLayout layoutWithListConfiguration:]"
---

# `UICollectionViewCompositionalLayout.layoutWithListConfiguration()` 静态方法

**`UICollectionViewCompositionalLayout.layoutWithListConfiguration()`** 静态方法用一份列表配置建一个列表布局。

## 语法

```
UICollectionViewCompositionalLayout.layoutWithListConfiguration(configuration)
```

### 参数

**`configuration`**

列表的配置，[`UICollectionLayoutListConfiguration`](../ui-collection-layout-list-configuration.md)。它在这一刻被复制进布局，之后再改它，已经建好的布局不变。

### 返回值

新建的 `UICollectionViewCompositionalLayout`，它也是 [`UICollectionViewLayout`](../ui-collection-view-layout.md)（实测）。交给 [`new UICollectionView()`](../ui-collection-view/constructor.md)。

### 异常

**`TypeError`**

`configuration` 不是配置对象（实测）。

## 示例

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
const layout = UICollectionViewCompositionalLayout.layoutWithListConfiguration(config);
console.log(layout instanceof UICollectionViewLayout);
const list = new UICollectionView(layout);
```

**结果**：输出 `true`。得到一个圆角卡片外观的列表。

## 对应的 iOS API

`+[UICollectionViewCompositionalLayout layoutWithListConfiguration:]`。

## 参见

- [`UICollectionLayoutListConfiguration`](../ui-collection-layout-list-configuration.md)
