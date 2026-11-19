---
type: reference
native: UICollectionLayoutListConfiguration.backgroundColor
---

# `UICollectionLayoutListConfiguration`: `backgroundColor` property

The **`backgroundColor`** property is the list's background color.

## Value

A [color](../ui-color.md) string, or `null`.

- Readable and writable.
- The default is `null`, meaning the background color that comes with the appearance is used.
- Writing `null` goes back to the default (measured).
- The configuration is copied into the layout the moment it is handed to `layoutWithListConfiguration()`. Changing it afterward does not change lists already created.

## Examples

```js
const config = new UICollectionLayoutListConfiguration('insetGrouped');
config.backgroundColor = 'systemBackground';
console.log(config.backgroundColor);
```

**Effect**: The console prints `systemBackground`. A list created with this configuration has the view controller's background color.

## Corresponding iOS API

`UICollectionLayoutListConfiguration.backgroundColor`.

## See also

- [Colors](../ui-color.md)
