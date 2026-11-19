---
type: reference
native: +[UIListContentConfiguration cellConfiguration]
---

# `UIListContentConfiguration.cellConfiguration()` static method

The **`UIListContentConfiguration.cellConfiguration()`** static method returns an empty content configuration in the "one line of primary text" style.

## Syntax

```
UIListContentConfiguration.cellConfiguration()
```

### Parameters

None.

### Return value

A new [`UIListContentConfiguration`](../ui-list-content-configuration.md) (verified by testing). `text`, `secondaryText`, and `image` are all `null`.

### Exceptions

None.

## Examples

```js
const content = UIListContentConfiguration.cellConfiguration();
content.text = 'Title';
content.secondaryText = 'Details';
```

**Effect**: produces content in the "one line of primary text" style, which appears once written to a cell's `contentConfiguration`. How the style looks on screen is **not verified in the simulator**; its meaning comes from Apple's documentation.

## Corresponding iOS API

`+[UIListContentConfiguration cellConfiguration]`.

## See also

- [`defaultContentConfiguration()`](../ui-collection-view-list-cell/defaultcontentconfiguration.md): the one that matches the list's appearance
