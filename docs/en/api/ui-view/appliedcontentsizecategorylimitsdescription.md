---
type: reference
native: UIView.appliedContentSizeCategoryLimitsDescription
---

# `UIView`: `appliedContentSizeCategoryLimitsDescription` property

The **`appliedContentSizeCategoryLimitsDescription`** property is a piece of descriptive text listing which text sizes are limited on this view and its ancestors. For debugging only.

## Value

A string, or `null`.

- Read-only; assigning to it throws `TypeError`.
- The type it reads back as is checked in the acceptance tests. The format of the content is up to the system; don't parse it.

## Examples

```js
const view = new UIView();
console.log(view.appliedContentSizeCategoryLimitsDescription);
```

**Result**: Prints the description the system provides. The exact content is **not verified in the simulator**.

## Corresponding iOS API

`UIView.appliedContentSizeCategoryLimitsDescription`.

## See also

- [Traits](../ui-trait-collection.md): `preferredContentSizeCategory`
