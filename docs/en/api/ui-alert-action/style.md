---
type: reference
native: UIAlertAction.style
---

# `UIAlertAction`: `style` property

The **`style`** property is the alert button's style.

## Value

A string, one of `'default'`, `'cancel'`, and `'destructive'`. For the effect of each, see [The three button styles](../ui-alert-action.md#the-three-button-styles).

- Read-only; assigning to it throws `TypeError`.
- The value is `options.style` from [`actionWithTitle()`](actionwithtitle.md) at creation. To change the style, create a new button.

## Examples

```js
const cancel = UIAlertAction.actionWithTitle('Cancel', { style: 'cancel' });
console.log(cancel.style);
```

**Result**: The console prints `cancel`.

## Corresponding iOS API

`UIAlertAction.style`. `UIAlertActionStyleCancel` is written `'cancel'`, and likewise for the rest.

## See also

- [`title`](title.md)
