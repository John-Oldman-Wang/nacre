---
type: reference
native: UIAlertController.message
---

# `UIAlertController`: `message` property

The **`message`** property is the message below the alert's title.

## Value

A string, or `null`.

- Readable and writable.
- Defaults to what `options.message` gave at creation; `null` if it wasn't given.
- `null` means no message. Non-string values written are converted to strings.
- Whether the screen updates when it changes while the alert is on screen is **not verified in the simulator**.
- No event fires when it changes: only the App itself can change it.

## Examples

```js
const alert = UIAlertController.alertControllerWithTitle('Couldn\'t save', {
  preferredStyle: 'alert',
});
alert.message = 'The network connection was lost. Please try again later.';
console.log(alert.message);
```

**Result**: logs `The network connection was lost. Please try again later.` to the console.

## Corresponding iOS API

`UIAlertController.message`.

## See also

- [`title`](../ui-view-controller/title.md): the alert's title, inherited from the view controller
