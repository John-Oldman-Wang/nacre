---
type: reference
native: UICollectionLayoutListConfiguration
status: partial
---

# `UICollectionLayoutListConfiguration`

**`UICollectionLayoutListConfiguration`** represents the configuration of a list layout: the list's appearance, whether separators are drawn between rows, the background color, and where section headers come from.

It is just data. The moment it is handed to [`UICollectionViewCompositionalLayout.layoutWithListConfiguration()`](ui-collection-view-compositional-layout/layoutwithlistconfiguration.md), the configuration is copied into the layout. Changing it afterward does not change lists already created.

**Inheritance**: `EventTarget` → `NSObject` → `UICollectionLayoutListConfiguration`

## Constructor

[`UICollectionLayoutListConfiguration()`](ui-collection-layout-list-configuration/constructor.md)

Creates a configuration with an appearance.

## Instance properties

| Property | Description |
| --- | --- |
| [`appearance`](ui-collection-layout-list-configuration/appearance.md) <small>read-only</small> | The appearance given at creation |
| [`showsSeparators`](ui-collection-layout-list-configuration/showsseparators.md) | Whether separators are drawn between rows |
| [`backgroundColor`](ui-collection-layout-list-configuration/backgroundcolor.md) | The list's background color |
| [`headerMode`](ui-collection-layout-list-configuration/headermode.md) | Where section headers come from |

## Examples

```js
const config = new UICollectionLayoutListConfiguration('plain');
config.showsSeparators = false;
const list = new UICollectionView(
  UICollectionViewCompositionalLayout.layoutWithListConfiguration(config));
```

**Effect**: A list whose rows span the full width, with no separators. How it looks on screen is **not verified in the simulator**.

> **Note:** The configuration is copied into the layout at the moment of `layoutWithListConfiguration()`. Changing `config` afterward does not change lists already created.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UICollectionLayoutListConfiguration alloc] initWithAppearance:UICollectionLayoutListAppearanceInsetGrouped]` | `new UICollectionLayoutListConfiguration('insetGrouped')` |
| `config.showsSeparators = NO` | `config.showsSeparators = false` |
| `config.headerMode = UICollectionLayoutListHeaderModeFirstItemInSection` | `config.headerMode = 'firstItemInSection'` |

## See also

- [`UICollectionViewCompositionalLayout`](ui-collection-view-compositional-layout.md)
- [Building a list](../guides/lists.md)
