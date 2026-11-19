---
type: reference
native: "+[UIAlertController alertControllerWithTitle:message:preferredStyle:]"
---

# `UIAlertController.alertControllerWithTitle()` static method

The **`UIAlertController.alertControllerWithTitle()`** static method creates an alert. Alerts can only be created with this method, not with `new`.

## Syntax

```
UIAlertController.alertControllerWithTitle(title, { message, preferredStyle })
```

### Parameters

**`title`**

The title, a string or `null`. Required. `null` means no title. Non-string values are converted to strings; for example, `5` becomes `'5'`. Afterward, read and write it through the inherited [`title`](../ui-view-controller/title.md).

**`options.message`**

The message below the title, a string or `null`. Optional. Omitting it or passing `null` means no message. Non-string values are converted to strings.

**`options.preferredStyle`**

The style. Required:

| Value | Effect |
| --- | --- |
| `'alert'` | An alert box that appears in the middle of the screen and can have text fields |
| `'actionSheet'` | A bottom menu that rises from the bottom of the screen and can't have text fields |

The style can't be changed afterward; see [`preferredStyle`](preferredstyle.md). How the two styles look on screen is **not verified in the simulator**.

### Return value

A new `UIAlertController`. Each call returns a new one. A new alert has no buttons; `actions` and `textFields` are both empty arrays.

### Exceptions

**`TypeError`**

`preferredStyle` is missing or not recognized, for example `preferredStyle has no value "modal"; expected one of: actionSheet / alert`.

## Examples

```js
const alert = UIAlertController.alertControllerWithTitle('Title', {
  message: 'Message text',
  preferredStyle: 'alert',
});
console.log(alert.title, alert.message, alert.preferredStyle);
```

**Result**: logs `Title Message text alert` to the console.

```js
const menu = UIAlertController.alertControllerWithTitle(null, {
  preferredStyle: 'actionSheet',
});
console.log(menu.title, menu.message);
```

**Result**: logs `null null` to the console. A bottom menu's title and message can both be `null`; then the menu has only buttons.

## Corresponding iOS API

`+[UIAlertController alertControllerWithTitle:message:preferredStyle:]`. `message` goes into the options; `UIAlertControllerStyleAlert` is written `'alert'`, and `UIAlertControllerStyleActionSheet` is written `'actionSheet'`.

## See also

- [The two styles](../ui-alert-controller.md#the-two-styles)
- [`addAction()`](addaction.md): adding buttons to the alert
