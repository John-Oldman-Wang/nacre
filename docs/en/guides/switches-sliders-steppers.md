# Building switches, sliders, and steppers

This guide shows how to let the user choose a value with three value controls: [`UISwitch`](../api/ui-switch.md) (a switch with two values), [`UISlider`](../api/ui-slider.md) (a slider that picks a value in a continuous range), and [`UIStepper`](../api/ui-stepper.md) (a stepper that increments and decrements one step at a time). Details of each property and method are on their reference pages.

## Recommended approach

- **Use [`change`](../api/ui-control/change-event.md) to find out the value changed.** All three controls fire `change` after the user changes the value, and the callback reads the changed value. Writing the value from code does not fire `change`, so restoring saved settings by writing directly doesn't trigger your own listeners. "Writing from code doesn't fire" is asserted in the acceptance tests.
- **Set the range first, then the value.** When a value written to a slider or stepper is out of range, there is no error; it is changed to the nearest end. If you write the value before changing the range, the value may already have been changed.
- **For actions that save or send a request, handle each drag only once.** By default, sliders and steppers fire `change` continuously while dragging or holding. Set `isContinuous` to `false` to fire only once on release.
- **The system determines the size of switches and steppers**; give them only position constraints. Give sliders a width.

## First example

Start from a blank app and stack a switch, a slider, and a stepper vertically on the view controller; each control prints its current value to the console when it changes.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Switch
  const sw = new UISwitch();
  sw.addEventListener('change', () => {
    console.log('Switch', sw.isOn);
  });

  // 2. Slider: set the range first, then the value
  const slider = new UISlider();
  slider.maximumValue = 100;
  slider.value = 40;
  slider.addEventListener('change', () => {
    console.log('Slider', Math.round(slider.value));
  });

  // 3. Stepper
  const stepper = new UIStepper();
  stepper.minimumValue = 1;
  stepper.maximumValue = 10;
  stepper.value = 1;
  stepper.addEventListener('change', () => {
    console.log('Stepper', stepper.value);
  });

  // 4. Stack them vertically on the view controller. The slider stretches to the column's width
  const column = new UIStackView([sw, slider, stepper]);
  column.axis = 'vertical';
  column.spacing = 20;
  column.alignment = 'leading';
  column.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(column);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    slider.widthAnchor.constraintEqualToAnchor(column.widthAnchor),
  ]);
});
```

**Effect** (not verified in the simulator)

- At the top of the view controller, from top to bottom: a switch that is off, a slider spanning the width, and a stepper.
- Tapping the switch prints `Switch true` to the console.
- Dragging the slider continuously prints lines like `Slider 41`, `Slider 42`.
- Tapping the stepper's plus prints `Stepper 2`.

`alignment = 'leading'` keeps the switch and stepper at their system-given size, aligned left; the slider is stretched to the column's width by a separate constraint. The sections below reuse `sw`, `slider`, and `stepper` from here. To try one section on its own, start with these lines:

```js
const page = new UIViewController();
const sw = new UISwitch();
const slider = new UISlider();
const stepper = new UIStepper();
const column = new UIStackView([sw, slider, stepper]);
column.axis = 'vertical';
page.view.addSubview(column);
```

## Switches

### Toggle with animation

```js
sw.setOn(false, { animated: true });
console.log(sw.isOn);
```

**Effect**: The knob slides to the left (not verified in the simulator). The console prints `false`: the value has already changed when the call returns; there is no need to wait for the animation to end.

Like writing `isOn`, `setOn()` does not fire `change`.

### Change the switch's colors

```js
sw.onTintColor = '#5856D6';
sw.thumbTintColor = '#FFFFFF';
```

**Effect** (not verified in the simulator): When on, the track is purple and the knob is white.

Writing `null` to either property returns it to the system default color. For how to write colors, see [Colors](../api/ui-color.md).

### Make the switch untappable

```js
sw.isEnabled = false;
```

**Effect** (not verified in the simulator): The switch fades, tapping it does nothing, and it fires no events.

`isEnabled` is inherited from [`UIControl`](../api/ui-control.md). Code can still write `isOn` after it is disabled.

### Revert the switch when saving fails

```js
/** @param {boolean} on @returns {Promise<void>} */
async function save(on) {
  // Send the setting to the server
}

sw.addEventListener('change', async () => {
  const wanted = sw.isOn;
  try {
    await save(wanted);
  } catch (err) {
    sw.setOn(!wanted, { animated: true });
  }
});
```

**Effect** (not verified in the simulator): The switch flips as soon as the user toggles it; if saving fails, it slides back to where it was.

Reverting uses `setOn()`, which does not fire `change`, so it doesn't trigger another save.

## Sliders

### Handle only on release

```js
slider.isContinuous = false;
slider.addEventListener('change', () => {
  console.log('Selected', Math.round(slider.value));
});
```

**Effect** (not verified in the simulator): Nothing is printed while dragging. One line is printed on release, for example `Selected 72`.

### Make the slider snap to fixed steps

The slider itself has no steps. Round the value in the callback and write it back, and the knob stops on a step:

```js
slider.addEventListener('change', () => {
  const step = 10;
  slider.value = Math.round(slider.value / step) * step;
  console.log('Volume', slider.value);
});
```

**Effect** (not verified in the simulator): While dragging, the knob jumps in steps of 10, and the console shows only numbers like 0, 10, 20.

Writing `value` in the callback doesn't fire `change` again, so there is no loop.

### Display the slider's value

The slider's three numeric values are single-precision floats: writing 0.3 reads back 0.30000001192092896. Before displaying, round it or keep a fixed number of decimal places:

```js
slider.maximumValue = 1;
slider.value = 0.3;
console.log(slider.value.toFixed(2));
```

**Effect**: The console prints `0.30`.

Also don't compare two decimal values with `===`.

### Change the slider's value with animation

```js
slider.maximumValue = 100;
slider.setValue(80, { animated: true });
console.log(slider.value);
```

**Effect**: The knob slides to the 80 position (not verified in the simulator). The console prints `80`: the value has already changed when the call returns.

### Change the slider's colors

```js
slider.minimumTrackTintColor = '#FF9500';
slider.maximumTrackTintColor = 'systemGray';
slider.thumbTintColor = '#FFFFFF';
```

**Effect** (not verified in the simulator): The track to the left of the knob is orange, the track to the right is gray, and the knob is white.

Writing `null` to any of the three properties returns it to the system default color.

### Put icons at both ends of the track

```js
slider.minimumValueImage = UIImage.systemImageNamed('speaker.fill');
slider.maximumValueImage = UIImage.systemImageNamed('speaker.wave.3.fill');
```

**Effect** (not verified in the simulator): Outside the left end of the track is a small speaker, and outside the right end is a speaker with sound waves. The track gets correspondingly shorter.

`systemImageNamed()` gets an icon from SF Symbols, the system's built-in icon set; see [`UIImage`](../api/ui-image.md).

### Make a bubble follow the knob

[`thumbRectForBounds()`](../api/ui-slider/thumbrectforbounds.md) gives where the knob is drawn within the slider. Use it to position another view:

```js
const bubble = new UILabel();
bubble.textAlignment = 'center';
slider.addSubview(bubble);

slider.addEventListener('change', () => {
  const track = slider.trackRectForBounds(slider.bounds);
  const thumb = slider.thumbRectForBounds(slider.bounds, { trackRect: track, value: slider.value });
  bubble.text = String(Math.round(slider.value));
  bubble.frame = new CGRect(thumb.x, thumb.y - 28, thumb.width, 24);
});
```

**Effect** (not verified in the simulator): While dragging, a number moves along directly above the knob.

Measured on a 300 × 34 pt slider without end icons: the track is `(0, 14, 300, 6)`; at the minimum value the knob is `(0, 5, 37, 24)`, and at the maximum value it is `(263, 5, 37, 24)`.

### No knob

```js
slider.sliderStyle = 'thumbless';
```

**Effect** (not verified in the simulator): The slider has no knob, only a partially filled track. Typically used to show playback progress.

## Steppers

### Increment and decrement by 0.5

```js
stepper.stepValue = 0.5;
```

**Effect** (not verified in the simulator): Tapping plus once changes the value from 1 to 1.5.

The stepper does not align the value to multiples of `stepValue`: if code writes `stepper.value = 1.3`, tapping plus then gives 1.8 (not verified in the simulator).

### Wrap back to the minimum after the maximum

```js
stepper.wraps = true;
```

**Effect** (not verified in the simulator): Tapping plus at 10 gives 1; tapping minus at 1 gives 10. Both buttons stay tappable.

`wraps` affects only the user tapping the buttons. When code writes an out-of-range value, it is still changed to the nearest end: measured with `wraps` on, writing 500 reads back the maximum.

### Don't change continuously while held

```js
stepper.autorepeat = false;
```

**Effect** (not verified in the simulator): Holding plus increments the value only once.

### When holding to keep incrementing, handle only once after release

```js
stepper.isContinuous = false;
stepper.addEventListener('change', () => {
  console.log('Set to', stepper.value);
});
```

**Effect** (not verified in the simulator): While plus is held, the value keeps increasing but nothing is printed. One line is printed after release.

### Display the stepper's value

The stepper doesn't display its value. Put a [`UILabel`](../api/ui-label.md) next to it and update it in `change`:

```js
const count = new UILabel();
count.text = 'Quantity ' + stepper.value;
stepper.addEventListener('change', () => {
  count.text = 'Quantity ' + stepper.value;
});
```

**Effect**: The text changes with each tap on plus or minus. `count` still needs to be put on the view controller; see the example on [`UIStepper`](../api/ui-stepper.md) for how.

## See also

- [`UISwitch`](../api/ui-switch.md), [`UISlider`](../api/ui-slider.md), [`UIStepper`](../api/ui-stepper.md): all properties and methods
- [`UIControl`](../api/ui-control.md): `isEnabled` and all control events
- [`UIStackView`](../api/ui-stack-view.md): arrange controls in a row or column
- [Colors](../api/ui-color.md): how to write color strings
