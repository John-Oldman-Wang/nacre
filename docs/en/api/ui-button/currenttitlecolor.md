---
type: reference
native: UIButton.currentTitleColor
---

# `UIButton`: `currentTitleColor` property

The **`currentTitleColor`** property is the title color the button is displaying right now: the one selected by the current [state](../ui-button.md#states).

## Value

A [color](../ui-color.md) string.

- Read-only. Assigning to it throws `TypeError`.
- When the current state hasn't been set separately, it reads the one for the `normal` state.
- There is no change notification. It changes with the button's [state](../ui-button.md#states): when a finger touches down and lifts (the system fires [control events](../ui-control.md#events) such as `touchdown` and `touchupinside`), or when code changes `isEnabled` or `isSelected`. The state itself has no change event, so read it again at those moments.
- Always has a value; never `null`.

## Examples

```js
const button = UIButton.buttonWithType('system');
button.setTitleColor('#FF3B30', { forState: ['normal'] });
console.log(button.currentTitleColor);
```

**Result**: Prints `#FF3B30`. The color string you wrote reads back as is.

## Corresponding iOS API

`UIButton.currentTitleColor`.

## See also

- [States](../ui-button.md#states): when the button is in which state
