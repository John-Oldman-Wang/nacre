---
type: reference
native: UIButton.currentAttributedTitle
---

# `UIButton`: `currentAttributedTitle` property

The **`currentAttributedTitle`** property is the styled title the button is displaying right now: the one selected by the current [state](../ui-button.md#states).

## Value

[`NSAttributedString`](../ns-attributed-string.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- When the current state hasn't been set separately, it reads the one for the `normal` state.
- There is no change notification. It changes with the button's [state](../ui-button.md#states): when a finger touches down and lifts (the system fires [control events](../ui-control.md#events) such as `touchdown` and `touchupinside`), or when code changes `isEnabled` or `isSelected`. The state itself has no change event, so read it again at those moments.
- `null` when no state has been set with [`setAttributedTitle()`](setattributedtitle.md).

## Examples

```js
const button = UIButton.buttonWithType('system');
console.log(button.currentAttributedTitle);
button.setAttributedTitle(new NSAttributedString('Submit', { foregroundColor: 'systemBlue' }),
                          { forState: ['normal'] });
console.log(button.currentAttributedTitle !== null);
```

**Result**: First prints `null`, then `true`.

## Corresponding iOS API

`UIButton.currentAttributedTitle`.

## See also

- [States](../ui-button.md#states): when the button is in which state
