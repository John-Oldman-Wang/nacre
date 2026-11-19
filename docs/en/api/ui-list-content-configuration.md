---
type: reference
native: UIListContentConfiguration
status: partial
---

# `UIListContentConfiguration`

**`UIListContentConfiguration`** represents the content of one row in a list: primary text, secondary text, and an image on the left.

It is only data. It appears on screen once written to a cell's [`contentConfiguration`](ui-collection-view-cell/contentconfiguration.md), and the cell stores a copy:

```js
/** @param {UICollectionViewListCell} cell */
function fill(cell) {
  const content = cell.defaultContentConfiguration();
  content.text = 'First';
  cell.contentConfiguration = content;
  content.text = 'Second';
}
```

**Effect**: calling `fill(cell)` on a cell makes it show "First". Changes made after writing to the cell affect the app's own copy; the copy in the cell does not change. To make it show "Second", assign it again. Reading `cell.contentConfiguration` also returns a copy, and changing that copy does not affect the cell either.

**Inheritance**: `EventTarget` → `NSObject` → `UIListContentConfiguration`

## Constructor

It cannot be created with `new`; `new UIListContentConfiguration()` throws `TypeError`. Get one from a cell's [`defaultContentConfiguration()`](ui-collection-view-list-cell/defaultcontentconfiguration.md), or use one of the three static methods below.

## Static methods

[`UIListContentConfiguration.cellConfiguration()`](ui-list-content-configuration/cellconfiguration.md)

A style with one line of primary text.

[`UIListContentConfiguration.subtitleCellConfiguration()`](ui-list-content-configuration/subtitlecellconfiguration.md)

A style with a line of secondary text below the primary text.

[`UIListContentConfiguration.valueCellConfiguration()`](ui-list-content-configuration/valuecellconfiguration.md)

A style with primary text on the left and secondary text on the right.

How the three styles look on screen is **not verified in the simulator**; their meanings come from Apple's documentation.

## Instance properties

| Property | Description |
| --- | --- |
| [`text`](ui-list-content-configuration/text.md) | Primary text |
| [`secondaryText`](ui-list-content-configuration/secondarytext.md) | Secondary text |
| [`image`](ui-list-content-configuration/image.md) | Image to the left of the text |

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIListContentConfiguration cellConfiguration]` | `UIListContentConfiguration.cellConfiguration()` |
| `content.text = @"x"` | `content.text = 'x'` |
| `content.image = image` | `content.image = image` |

## See also

- [`UICollectionViewListCell`](ui-collection-view-list-cell.md)
- [`UICollectionViewCell`](ui-collection-view-cell.md)
