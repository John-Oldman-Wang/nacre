---
type: reference
native: +[UIListContentConfiguration valueCellConfiguration]
---

# `UIListContentConfiguration.valueCellConfiguration()` static method

The **`UIListContentConfiguration.valueCellConfiguration()`** static method returns an empty content configuration in the "primary text on the left, secondary text on the right" style.

## Syntax

```
UIListContentConfiguration.valueCellConfiguration()
```

### Parameters

None.

### Return value

A new [`UIListContentConfiguration`](../ui-list-content-configuration.md) (verified by testing). `text`, `secondaryText`, and `image` are all `null`.

### Exceptions

None.

## Examples

```js
const content = UIListContentConfiguration.valueCellConfiguration();
content.text = 'Title';
content.secondaryText = 'Details';
```

**Effect**: produces content in the "primary text on the left, secondary text on the right" style, which appears once written to a cell's `contentConfiguration`. How the style looks on screen is **not verified in the simulator**; its meaning comes from Apple's documentation.

## Corresponding iOS API

`+[UIListContentConfiguration valueCellConfiguration]`.

## See also

- [`defaultContentConfiguration()`](../ui-collection-view-list-cell/defaultcontentconfiguration.md): the one that matches the list's appearance
