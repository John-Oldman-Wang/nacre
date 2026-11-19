---
type: reference
native: UIStepper
status: partial
---

# `UIStepper`

**`UIStepper`** represents a stepper: a minus button and a plus button side by side. Each tap decreases or increases the value by one step. Use it where the user adjusts the current value up or down a little, such as a quantity or a number of people.

A stepper has only the two buttons and **does not display the value**. Read and write the current value through [`value`](ui-stepper/value.md); to display it, add a separate [`UILabel`](ui-label.md) and update it in the [`change`](ui-control/change-event.md) event.

[`stepValue`](ui-stepper/stepvalue.md) determines how much each tap changes the value, and [`minimumValue`](ui-stepper/minimumvalue.md) and [`maximumValue`](ui-stepper/maximumvalue.md) determine the range. At either end of the range, the button on that side becomes disabled. While the user holds a button down, the value changes continuously.

The system determines the stepper's size; measured on iOS 27.2 it is 94 × 32 [pt](units.md). With Auto Layout, give it only position constraints.

A stepper is a [control](ui-control.md): disabling, state, and events come from `UIControl`.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UIStepper`

For common patterns, see the guide [Building switches, sliders, and steppers](../guides/switches-sliders-steppers.md).

## Constructor

[`UIStepper()`](ui-stepper/constructor.md)

Creates a stepper with a range of 0 to 100 and a step of 1.

## Instance properties

Also inherits the properties of [`UIControl`](ui-control.md) and [`UIView`](ui-view.md). The inherited property most often used with steppers is [`isEnabled`](ui-control/isenabled.md).

| Property | Description |
| --- | --- |
| [`value`](ui-stepper/value.md) | The current value |
| [`minimumValue`](ui-stepper/minimumvalue.md) | The lower bound of the range |
| [`maximumValue`](ui-stepper/maximumvalue.md) | The upper bound of the range |
| [`stepValue`](ui-stepper/stepvalue.md) | How much each tap adds or subtracts |
| [`isContinuous`](ui-stepper/iscontinuous.md) | Whether `change` fires on every change while the button is held, or only after release |
| [`autorepeat`](ui-stepper/autorepeat.md) | Whether holding a button keeps adding or subtracting |
| [`wraps`](ui-stepper/wraps.md) | Whether tapping at one end goes around to the other end |

## Instance methods

The stepper has no methods of its own. It inherits the methods of [`UIControl`](ui-control.md) and [`UIView`](ui-view.md).

## Events

The stepper's events are inherited from [`UIControl`](ui-control.md); listen with `addEventListener()`. The stepper uses:

| Event | When it fires |
| --- | --- |
| [`change`](ui-control/change-event.md) | The user tapped plus or minus and the value changed. Writing `value` in code does not fire it |

## Examples

### Choosing a quantity

Starting from a blank app, put a line "Quantity 1" and a stepper on screen, with the quantity between 1 and 10.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.text = 'Quantity 1';

  // Set the range first, then the value
  const stepper = new UIStepper();
  stepper.minimumValue = 1;
  stepper.maximumValue = 10;
  stepper.value = 1;

  stepper.addEventListener('change', () => {
    label.text = 'Quantity ' + stepper.value;
  });

  const row = new UIStackView([label, stepper]);
  row.spacing = 12;
  row.alignment = 'center';
  row.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(row);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    row.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    row.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  ]);
});
```

**Effect** (not verified in the simulator)

- "Quantity 1" appears near the top left of the screen, with a stepper with minus and plus buttons to its right. The minus button is gray.
- Tapping plus changes the text to "Quantity 2", and the minus button becomes enabled.
- Holding plus down increases the number continuously until it stops at "Quantity 10", and the plus button turns gray.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIStepper alloc] init]` | `new UIStepper()` |
| `stepper.value = 5` | `stepper.value = 5` |
| `stepper.stepValue = 0.5` | `stepper.stepValue = 0.5` |
| `stepper.continuous = NO` | `stepper.isContinuous = false` |
| `stepper.wraps = YES` | `stepper.wraps = true` |
| `[stepper addTarget:self action:@selector(changed:) forControlEvents:UIControlEventValueChanged]` | `stepper.addEventListener('change', fn)` |

## Comparison with the browser

| Browser | Nacre |
| --- | --- |
| `<input type="number" min max step>`, with a text box and up/down arrows | `new UIStepper()` has only the two buttons and no text box; display the value yourself |
| `input.stepUp()`, `input.stepDown()` | No corresponding methods. Write `stepper.value += stepper.stepValue` yourself |

## See also

- [Building switches, sliders, and steppers](../guides/switches-sliders-steppers.md): steps of 0.5, wrapping, handling only after release
- [`UIControl`](ui-control.md): `isEnabled` and all control events
- [`UILabel`](ui-label.md): displaying the current value
- [`UISlider`](ui-slider.md): use a slider when the range is large and exact steps are not needed
