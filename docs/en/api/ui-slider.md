---
type: reference
native: UISlider
status: partial
---

# `UISlider`

**`UISlider`** represents a slider: a horizontal track with a round thumb that the user drags to pick a number within a range. It is used for volume, brightness, playback position, and other places where you pick a value from a continuous range.

The range is set by [`minimumValue`](ui-slider/minimumvalue.md) and [`maximumValue`](ui-slider/maximumvalue.md), 0 to 1 by default. Read and write the current value with [`value`](ui-slider/value.md). When the user drags, the slider fires the [`change`](ui-control/change-event.md) event; by default it fires many times continuously during the drag, and when [`isContinuous`](ui-slider/iscontinuous.md) is set to `false` it fires only once, on release.

The slider's height is determined by the system; measured on iOS 27.2 it is 34 [pt](units.md). The slider has no width of its own: your code must give it one, with `frame` or a width constraint. Without a width, it is 0 wide and not visible on screen.

The three numeric values are single-precision floats: writing 0.3 reads back 0.30000001192092896.

A slider is a [control](ui-control.md): enabling, state, and events come from `UIControl`.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UISlider`

For common patterns, see the guide [Building switches, sliders, and steppers](../guides/switches-sliders-steppers.md).

## Constructor

[`UISlider()`](ui-slider/constructor.md)

Creates a slider with a range of 0 to 1 and a value of 0.

## Instance properties

Also inherits properties from [`UIControl`](ui-control.md) and [`UIView`](ui-view.md). Inherited properties commonly used with sliders are [`isEnabled`](ui-control/isenabled.md) and `frame`.

Values:

| Property | Description |
| --- | --- |
| [`value`](ui-slider/value.md) | The current value |
| [`minimumValue`](ui-slider/minimumvalue.md) | The lower bound of the range |
| [`maximumValue`](ui-slider/maximumvalue.md) | The upper bound of the range |
| [`isContinuous`](ui-slider/iscontinuous.md) | Whether `change` fires continuously during a drag |

Appearance:

| Property | Description |
| --- | --- |
| [`sliderStyle`](ui-slider/sliderstyle.md) | Whether there is a thumb |
| [`minimumTrackTintColor`](ui-slider/minimumtracktintcolor.md) | The color of the track to the left of the thumb |
| [`maximumTrackTintColor`](ui-slider/maximumtracktintcolor.md) | The color of the track to the right of the thumb |
| [`thumbTintColor`](ui-slider/thumbtintcolor.md) | The color of the thumb |
| [`minimumValueImage`](ui-slider/minimumvalueimage.md) | The image outside the left end of the track |
| [`maximumValueImage`](ui-slider/maximumvalueimage.md) | The image outside the right end of the track |
| [`currentThumbImage`](ui-slider/currentthumbimage.md) <small>read-only</small> | The thumb image used in the current state |
| [`currentMinimumTrackImage`](ui-slider/currentminimumtrackimage.md) <small>read-only</small> | The left track image used in the current state |
| [`currentMaximumTrackImage`](ui-slider/currentmaximumtrackimage.md) <small>read-only</small> | The right track image used in the current state |

## Instance methods

Also inherits methods from [`UIControl`](ui-control.md) and [`UIView`](ui-view.md).

| Method | Description |
| --- | --- |
| [`setValue()`](ui-slider/setvalue.md) | Changes the value, optionally animated |

To replace the thumb and track with images, set them per [state](ui-control.md#states):

| Method | Description |
| --- | --- |
| [`setThumbImage()`](ui-slider/setthumbimage.md) | Sets the thumb image |
| [`setMinimumTrackImage()`](ui-slider/setminimumtrackimage.md) | Sets the left track image |
| [`setMaximumTrackImage()`](ui-slider/setmaximumtrackimage.md) | Sets the right track image |
| [`thumbImageForState()`](ui-slider/thumbimageforstate.md) | The thumb image for a given state |
| [`minimumTrackImageForState()`](ui-slider/minimumtrackimageforstate.md) | The left track image for a given state |
| [`maximumTrackImageForState()`](ui-slider/maximumtrackimageforstate.md) | The right track image for a given state |

Where each part is drawn within the slider:

| Method | Description |
| --- | --- |
| [`trackRectForBounds()`](ui-slider/trackrectforbounds.md) | The position of the track |
| [`thumbRectForBounds()`](ui-slider/thumbrectforbounds.md) | The position of the thumb for a given value |
| [`minimumValueImageRectForBounds()`](ui-slider/minimumvalueimagerectforbounds.md) | The position of the left-end image |
| [`maximumValueImageRectForBounds()`](ui-slider/maximumvalueimagerectforbounds.md) | The position of the right-end image |

## Events

A slider's events are inherited from [`UIControl`](ui-control.md); listen with `addEventListener()`. The ones a slider uses are:

| Event | When it fires |
| --- | --- |
| [`change`](ui-control/change-event.md) | The user changed the value by dragging. When `isContinuous` is `true` it fires continuously during the drag; when `false`, once on release. Writing `value` from code doesn't fire it |
| [`touchdown`](ui-control/touchdown-event.md) | A finger touches down on the slider |
| [`touchupinside`](ui-control/touchupinside-event.md), [`touchupoutside`](ui-control/touchupoutside-event.md) | The finger lifts |

## Examples

### Volume slider

Starting from a blank app, place a slider from 0 to 100 on screen, with a label above it showing the current value.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.text = 'Volume 40';

  // Set the range first, then the value
  const slider = new UISlider();
  slider.maximumValue = 100;
  slider.value = 40;

  slider.addEventListener('change', () => {
    label.text = 'Volume ' + Math.round(slider.value);
  });

  // A vertical UIStackView stretches the slider to its own width
  const column = new UIStackView([label, slider]);
  column.axis = 'vertical';
  column.spacing = 12;
  column.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(column);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    column.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  ]);
});
```

**Effect** (not verified in the simulator)

- "Volume 40" appears near the top of the screen, with a slider spanning the screen below it and the thumb toward the left.
- Dragging the thumb changes the number in the label.
- Dragging all the way to the right shows "Volume 100".

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UISlider alloc] init]` | `new UISlider()` |
| `slider.value = 0.5f` | `slider.value = 0.5` |
| `[slider setValue:0.5f animated:YES]` | `slider.setValue(0.5, { animated: true })` |
| `slider.continuous = NO` | `slider.isContinuous = false` |
| `slider.minimumTrackTintColor = UIColor.orangeColor` | `slider.minimumTrackTintColor = 'orange'` |
| `[slider setThumbImage:image forState:UIControlStateNormal]` | `slider.setThumbImage(image, { forState: ['normal'] })` |
| `[slider thumbImageForState:UIControlStateNormal]` | `slider.thumbImageForState('normal')` |
| `[slider thumbRectForBounds:b trackRect:t value:v]` | `slider.thumbRectForBounds(b, { trackRect: t, value: v })` |
| `slider.sliderStyle = UISliderStyleThumbless` | `slider.sliderStyle = 'thumbless'` |

## Comparison with the browser

| Browser | Nacre |
| --- | --- |
| `<input type="range" min max step>` | `new UISlider()`, `minimumValue`, `maximumValue`. There is no `step`; see [Snapping to fixed steps](../guides/switches-sliders-steppers.md#make-the-slider-snap-to-fixed-steps) |
| `input` event (during the drag) | `change` with `isContinuous` set to `true` |
| `change` event (on release) | `change` with `isContinuous` set to `false` |

## See also

- [Building switches, sliders, and steppers](../guides/switches-sliders-steppers.md): handling only on release, snapping to steps, a bubble that follows the thumb
- [`UIControl`](ui-control.md): control states and all control events
- [`UIImage`](ui-image.md): getting SF Symbols and your own images
- [Colors](ui-color.md): how to write color strings
- [Structs](structs.md): `CGRect`
