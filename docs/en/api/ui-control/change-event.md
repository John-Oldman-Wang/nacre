---
type: reference
native: UIControlEventValueChanged
---

# `UIControl`: `change` event

The **`change`** event fires after the user changes the control's value.

## Syntax

```
addEventListener('change', (event) => { })
```

## Event object

A plain `Event` with no fields other than `type` and `target`. It has no touch location: reading `location` gives `undefined`. `change` does not necessarily come from a touch; code calling `sendActionsForControlEvents()` also fires it.

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- Fired by controls that have a value: [`UISwitch`](../ui-switch.md), [`UISlider`](../ui-slider.md), [`UIStepper`](../ui-stepper.md), [`UISegmentedControl`](../ui-segmented-control.md), [`UIPageControl`](../ui-page-control.md), [`UIDatePicker`](../ui-date-picker.md), and [`UIColorWell`](../system-controls.md). Reading the control's value in the callback gives the value after the change.
- Writing a value from code does not fire it: writing `isOn`, `value`, `selectedSegmentIndex`, `currentPage`, or `date`, or calling `setOn()`, `setValue()`, or `setDate()`, does not fire it (asserted in the acceptance tests: none of the six controls received `change` after a value was written). So when restoring the UI from saved settings, you can write values directly without triggering your own listeners.
- Sliders and steppers fire it continuously while being dragged or held. To fire only once on release, set their `isContinuous` to `false`.
- Calling `sendActionsForControlEvents(['change'])` on the controls above reaches the listeners (measured).
- Buttons, a `UIControl` created directly, and text fields do not fire it. For text field text changes, use [`input`](input-event.md).

## Examples

```js
const sw = new UISwitch();
sw.addEventListener('change', () => {
  console.log('Switch', sw.isOn);
});
```

**Effect**: When the user flips the switch, the console prints the value after the change, for example `Switch true`. Writing `sw.isOn` from code prints nothing.

## Corresponding iOS API

`UIControlEventValueChanged`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [Building switches, sliders, and steppers](../../guides/switches-sliders-steppers.md)
- [When callbacks run](../ui-control.md#when-callbacks-run)
