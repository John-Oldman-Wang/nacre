---
type: reference
native: UIListContentConfiguration
status: partial
---

# `UIListContentConfiguration`

**`UIListContentConfiguration`** 表示列表里一行的内容：主文字、副文字、左边的图片。

它只是一份数据。写给单元格的 [`contentConfiguration`](ui-collection-view-cell/contentconfiguration.md) 之后才显示出来，而且单元格存下的是副本：

```js
/** @param {UICollectionViewListCell} cell */
function fill(cell) {
  const content = cell.defaultContentConfiguration();
  content.text = '第一次';
  cell.contentConfiguration = content;
  content.text = '第二次';
}
```

**效果**：对一个单元格调 `fill(cell)`，单元格显示「第一次」。写给单元格之后改的是 App 手里的那一份，单元格里的副本不变。要让它显示「第二次」，再赋值一次。读 `cell.contentConfiguration` 得到的也是副本，改它同样不影响单元格。

**继承关系**：`EventTarget` → `NSObject` → `UIListContentConfiguration`

## 构造函数

不能用 `new` 创建，`new UIListContentConfiguration()` 抛 `TypeError`。从单元格的 [`defaultContentConfiguration()`](ui-collection-view-list-cell/defaultcontentconfiguration.md) 拿，或者用下面三个静态方法。

## 静态方法

[`UIListContentConfiguration.cellConfiguration()`](ui-list-content-configuration/cellconfiguration.md)

一行主文字的样式。

[`UIListContentConfiguration.subtitleCellConfiguration()`](ui-list-content-configuration/subtitlecellconfiguration.md)

主文字下面一行副文字的样式。

[`UIListContentConfiguration.valueCellConfiguration()`](ui-list-content-configuration/valuecellconfiguration.md)

主文字在左、副文字在右的样式。

三种样式在屏幕上的样子**未在模拟器验证**，含义来自 Apple 的文档。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`text`](ui-list-content-configuration/text.md) | 主文字 |
| [`secondaryText`](ui-list-content-configuration/secondarytext.md) | 副文字 |
| [`image`](ui-list-content-configuration/image.md) | 文字左边的图片 |

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[UIListContentConfiguration cellConfiguration]` | `UIListContentConfiguration.cellConfiguration()` |
| `content.text = @"x"` | `content.text = 'x'` |
| `content.image = image` | `content.image = image` |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 改文字的字体和颜色、图片的大小 | `textProperties`、`secondaryTextProperties`、`imageProperties`。可以在单元格的 `contentView` 里放自己的视图 |
| 带样式的文字 | `attributedText`、`secondaryAttributedText` |
| 改内边距和间距 | `directionalLayoutMargins`、`imageToTextPadding` |

## 参见

- [`UICollectionViewListCell`](ui-collection-view-list-cell.md)
- [`UICollectionViewCell`](ui-collection-view-cell.md)
