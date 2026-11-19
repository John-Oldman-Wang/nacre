---
type: reference
native: "-[UICollectionViewListCell defaultContentConfiguration]"
---

# `UICollectionViewListCell`：`defaultContentConfiguration()` 方法

**`defaultContentConfiguration()`** 方法返回一份和列表外观配套的内容配置，上面还没有内容。

## 语法

```
defaultContentConfiguration()
```

### 参数

无。

### 返回值

新建的 [`UIListContentConfiguration`](../ui-list-content-configuration.md)。设好文字和图片之后写给单元格的 [`contentConfiguration`](../ui-collection-view-cell/contentconfiguration.md)。

### 异常

无。

## 示例

```js
/** @param {UICollectionViewListCell} cell */
function inspect(cell) {
  const content = cell.defaultContentConfiguration();
  content.text = '咖啡豆 500 g';
  content.secondaryText = '已发货';
  cell.contentConfiguration = content;
}
```

**效果**：对一个单元格调 `inspect(cell)`，这一行上面是「咖啡豆 500 g」，下面是灰色的「已发货」。

## 对应的 iOS API

`-[UICollectionViewListCell defaultContentConfiguration]`。

## 参见

- [`UIListContentConfiguration`](../ui-list-content-configuration.md)
