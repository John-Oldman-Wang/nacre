---
type: reference
native: UIButton.currentImage
---

# `UIButton`: `currentImage` property

The **`currentImage`** property is the image the button is displaying right now: the one selected by the current [state](../ui-button.md#states).

## Value

[`UIImage`](../ui-image.md), or `null`.

- Read-only. Assigning to it throws `TypeError`.
- When the current state hasn't been set separately, it reads the one for the `normal` state.
- There is no change notification. It changes with the button's [state](../ui-button.md#states): when a finger touches down and lifts (the system fires [control events](../ui-control.md#events) such as `touchdown` and `touchupinside`), or when code changes `isEnabled` or `isSelected`. The state itself has no change event, so read it again at those moments.
- `null` when no state has an image set. **Not verified in the simulator.**

## Examples

```js
const button = UIButton.buttonWithType('system');
button.setImage(UIImage.systemImageNamed('heart'), { forState: ['normal'] });
console.log(button.currentImage !== null);
```

**Result**: Prints `true`. **Not verified in the simulator.**

## Corresponding iOS API

`UIButton.currentImage`.

## See also

- [States](../ui-button.md#states): when the button is in which state
