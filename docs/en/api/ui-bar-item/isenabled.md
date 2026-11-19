---
type: reference
native: UIBarItem.enabled
---

# `UIBarItem`: `isEnabled` property

The **`isEnabled`** property determines whether a navigation bar button or tab can be tapped.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Can be tapped |
| `false` | Grayed out; tapping does nothing |

- Readable and writable.
- The default is `true`.
- Non-boolean values are converted with `Boolean(v)` on write.
- "Grayed out" and "tapping does nothing" are **not verified in the simulator**.
- No event fires when it changes: only code changes it.

## Examples

```js
const submit = new UIBarButtonItem({ title: 'Submit' });
submit.isEnabled = false;
console.log(submit.isEnabled);
```

**Result**: The console prints `false`. "Submit" on the navigation bar is gray, and tapping it does nothing; setting it back to `true` restores it. This is the property for disabling the submit button while a form is incomplete.

## Corresponding iOS API

`UIBarItem.enabled`. In JS it is named `isEnabled`.

## See also

- [`isHidden`](../ui-bar-button-item/ishidden.md): temporarily hiding it
