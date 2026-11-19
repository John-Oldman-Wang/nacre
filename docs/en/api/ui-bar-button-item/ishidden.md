---
type: reference
native: UIBarButtonItem.hidden
---

# `UIBarButtonItem`: `isHidden` property

The **`isHidden`** property temporarily hides a navigation bar button.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The button disappears from the navigation bar but stays in the button array |
| `false` | Displayed |

- Readable and writable.
- Defaults to `false`.
- Non-boolean values are converted with `Boolean(v)`.
- The effect on screen is **not verified in the simulator**.
- No event fires when it changes: it only changes through code.

## Examples

```js
const page = new UIViewController();
const submit = new UIBarButtonItem({ title: 'Submit' });
page.navigationItem.rightBarButtonItems = [submit];

submit.isHidden = true;
console.log(page.navigationItem.rightBarButtonItems.length);
```

**Result**: the button disappears from the navigation bar, and the console prints `1`: it's still in `rightBarButtonItems`. The disappearance is **not verified in the simulator**.

## Corresponding iOS API

`UIBarButtonItem.hidden`. In JS it's called `isHidden`.

## See also

- [`isEnabled`](../ui-bar-item/isenabled.md): displayed but not tappable
