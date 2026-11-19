---
type: reference
native: "-[UIAlertController addAction:]"
---

# `UIAlertController`: `addAction()` method

The **`addAction()`** method adds a button to the alert.

## Syntax

```
addAction(action)
```

### Parameters

**`action`**

A [`UIAlertAction`](../ui-alert-action.md), created with [`UIAlertAction.actionWithTitle()`](../ui-alert-action/actionwithtitle.md).

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

- The argument is not a `UIAlertAction`: `addAction needs a UIAlertAction`.
- The alert already has a button with the cancel style and another one is added: `addAction: an alert can have only one action with the cancel style`.

## Description

- The buttons appear on the alert in the order they were added; the system positions the cancel-style button. In an alert box, two buttons are laid out side by side and three or more are stacked vertically, **not verified in the simulator**.
- Added buttons are retained by the alert. Even if JS no longer keeps a reference to a button, the button and its listeners are not lost.
- Adding the same button twice isn't rejected by the system, and it appears twice in [`actions`](actions.md). Don't do this.
- What happens when a button is added after the alert is already on screen is **not verified in the simulator**. Add all buttons before presenting.

## Examples

```js
const alert = UIAlertController.alertControllerWithTitle('Notice', {
  preferredStyle: 'alert',
});
alert.addAction(UIAlertAction.actionWithTitle('OK', { style: 'default' }));
console.log(alert.actions.length);
```

**Result**: logs `1` to the console.

## Corresponding iOS API

`-[UIAlertController addAction:]`.

## See also

- [`UIAlertAction`](../ui-alert-action.md)
- [`actions`](actions.md)
- [`preferredAction`](preferredaction.md)
