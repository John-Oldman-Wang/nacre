---
type: reference
native: UIButton.currentTitle
---

# `UIButton`: `currentTitle` property

The **`currentTitle`** property is the title the button is displaying right now: the one selected by the current [state](../ui-button.md#states).

## Value

A string, or `null`.

- Read-only. Assigning to it throws `TypeError`.
- When the current state hasn't been set separately, it reads the one for the `normal` state.
- There is no change notification. It changes with the button's [state](../ui-button.md#states): when a finger touches down and lifts (the system fires [control events](../ui-control.md#events) such as `touchdown` and `touchupinside`), or when code changes `isEnabled` or `isSelected`. The state itself has no change event, so read it again at those moments.
- `null` when no state has a title set.

## Examples

```js
const button = UIButton.buttonWithType('system');
button.setTitle('Submit', { forState: ['normal'] });
button.setTitle('Fill in the form first', { forState: ['disabled'] });

console.log(button.currentTitle);
button.isEnabled = false;
console.log(button.currentTitle);
```

**Result**: First prints `Submit`; after disabling, prints `Fill in the form first`.

## Corresponding iOS API

`UIButton.currentTitle`.

## See also

- [States](../ui-button.md#states): when the button is in which state
