---
type: reference
native: UIAlertController.preferredStyle
---

# `UIAlertController`: `preferredStyle` property

The **`preferredStyle`** property is the alert's style, fixed at creation.

## Value

A string:

| Value | Effect |
| --- | --- |
| `'alert'` | An alert box that appears in the middle of the screen and can have text fields |
| `'actionSheet'` | A bottom menu that rises from the bottom of the screen and can't have text fields |

- Read-only. Assigning to it throws `TypeError`.
- The value is the `options.preferredStyle` given to [`alertControllerWithTitle()`](alertcontrollerwithtitle.md) at creation. To use a different style, create a new alert.

## Examples

```js
const menu = UIAlertController.alertControllerWithTitle(null, {
  preferredStyle: 'actionSheet',
});
console.log(menu.preferredStyle);
```

**Result**: logs `actionSheet` to the console.

## Corresponding iOS API

`UIAlertController.preferredStyle`. `UIAlertControllerStyleActionSheet` is written `'actionSheet'`.

## See also

- [The two styles](../ui-alert-controller.md#the-two-styles)
