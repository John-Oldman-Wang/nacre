---
type: reference
native: "+[UIAlertAction actionWithTitle:style:handler:]"
---

# `UIAlertAction.actionWithTitle()` static method

The **`UIAlertAction.actionWithTitle()`** static method creates an alert button. Buttons can only be created with this method, not with `new`.

## Syntax

```
UIAlertAction.actionWithTitle(title, { style })
```

### Parameters

**`title`**

The text on the button, a string, required. Non-strings are converted to strings; `null` and `undefined` give the empty string. The system doesn't accept buttons without a title, so it never reads back as `null`.

**`options.style`**

The style, required:

| Value | Effect |
| --- | --- |
| `'default'` | A normal button |
| `'cancel'` | Cancel. Its position is arranged by the system. At most one per alert |
| `'destructive'` | The title is red, indicating the action deletes something or can't be undone |

How the three styles look on screen is **not verified in the simulator**.

### Return value

A new `UIAlertAction`. Each call gives a new one. [`isEnabled`](isenabled.md) is `true`.

### Exceptions

**`TypeError`**

`style` is missing or unknown, for example `style has no value "primary"; expected one of: default / cancel / destructive`.

## Description

To act when the button is tapped, listen for [`click`](click-event.md) on the button. There is no callback parameter.

## Examples

```js
const remove = UIAlertAction.actionWithTitle('Delete', { style: 'destructive' });
console.log(remove.title, remove.style, remove.isEnabled);
```

**Result**: The console prints `Delete destructive true`.

## Corresponding iOS API

`+[UIAlertAction actionWithTitle:style:handler:]`. `handler` is replaced by the `click` event on the button; `UIAlertActionStyleDestructive` is written `'destructive'`, and likewise for the rest.

## See also

- [`click`](click-event.md)
- [`UIAlertController.addAction()`](../ui-alert-controller/addaction.md)
