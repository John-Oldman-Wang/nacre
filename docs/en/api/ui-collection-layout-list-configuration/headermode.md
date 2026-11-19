---
type: reference
native: UICollectionLayoutListConfiguration.headerMode
---

# `UICollectionLayoutListConfiguration`: `headerMode` property

The **`headerMode`** property decides where section headers come from.

## Value

A string, one of these two:

| Value | Effect |
| --- | --- |
| `'none'` | Sections have no header |
| `'firstItemInSection'` | The first item of each section is shown as its header |

- Readable and writable.
- The default is `'none'`.
- What the header looks like is **not verified in the simulator**.
- The configuration is copied into the layout the moment it is handed to `layoutWithListConfiguration()`. Changing it afterward does not change lists already created.

### Invalid values

- Writing `'supplementary'` (the header is a separate view): not supported yet; throws `TypeError` (measured).
- Writing any other unrecognized value: does not throw; the console prints a warning and the value is unchanged (measured).

## Examples

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
config.headerMode = 'firstItemInSection';
console.log(config.headerMode);
```

**Effect**: The console prints `firstItemInSection`. In a list created with this configuration, the first item of each section is shown as its header.

## Corresponding iOS API

`UICollectionLayoutListConfiguration.headerMode`. `UICollectionLayoutListHeaderModeFirstItemInSection` is written `'firstItemInSection'`. `UICollectionLayoutListHeaderModeSupplementary` is not supported yet.

## See also

- [`UICollectionLayoutListConfiguration`](../ui-collection-layout-list-configuration.md)
