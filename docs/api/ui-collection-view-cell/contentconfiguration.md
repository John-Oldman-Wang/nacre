---
type: reference
native: UICollectionViewCell.contentConfiguration
---

# `UICollectionViewCell`：`contentConfiguration` 属性

**`contentConfiguration`** 属性是单元格的内容：主文字、副文字、图片。

## 值

[`UIListContentConfiguration`](../ui-list-content-configuration.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- **写进去的是一份副本。** 之后再改那个对象不影响单元格；要改显示的内容，再赋值一次。
- **读出来的也是副本**（实测），改它不影响单元格。
- 写 `null` 清掉，这时 `contentView` 里只有自己加的子视图。
- 单元格是复用的，`cellProvider` 里每次都要重新写它。

## 示例

```js
/** @param {UICollectionViewListCell} cell */
function inspect(cell) {
  const content = cell.defaultContentConfiguration();
  content.text = '第一次';
  cell.contentConfiguration = content;
  content.text = '第二次';
  const back = cell.contentConfiguration;
  console.log(back === null ? null : back.text);
}
```

**结果**：对一个单元格调 `inspect(cell)`，输出 `第一次`，单元格也显示「第一次」。

## 对应的 iOS API

`UICollectionViewCell.contentConfiguration`。

## 参见

- [`UIListContentConfiguration`](../ui-list-content-configuration.md)
- [`defaultContentConfiguration()`](../ui-collection-view-list-cell/defaultcontentconfiguration.md)
