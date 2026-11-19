---
type: reference
native: UISwitch
status: partial
---

# `UISwitch`

**`UISwitch`** represents a switch: a round thumb on a short track, off when the thumb is on the left and on when it is on the right. The user taps it or drags the thumb to toggle it. It is used where something has only two values and takes effect immediately when toggled, such as "whether to enable an option".

Read and write the switch's state through [`isOn`](ui-switch/ison.md). After the user toggles it, the switch fires the [`change`](ui-control/change-event.md) event; writing `isOn` in code doesn't fire it.

The switch's size is decided by the system; writing the width and height of `frame` has no effect. The switch has no text of its own; use a [`UILabel`](ui-label.md) for the description next to it and put the two together in a horizontal [`UIStackView`](ui-stack-view.md).

A switch is a [control](ui-control.md): disabling, state, and events come from `UIControl`. A control is in turn a [view](ui-view.md): position and background color come from `UIView`.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UISwitch`

For how to make a settings item with a switch, see the guide [Building switches, sliders, and steppers](../guides/switches-sliders-steppers.md).

## Constructor

[`UISwitch()`](ui-switch/constructor.md)

Creates a switch that is off.

## Instance properties

Also inherits the properties of [`UIControl`](ui-control.md) and [`UIView`](ui-view.md). The inherited property most often used on a switch is [`isEnabled`](ui-control/isenabled.md).

| Property | Description |
| --- | --- |
| [`isOn`](ui-switch/ison.md) | Whether it is on or off |
| [`onTintColor`](ui-switch/ontintcolor.md) | The color of the track when it is on |
| [`thumbTintColor`](ui-switch/thumbtintcolor.md) | The color of the thumb |

## Instance methods

Also inherits the methods of [`UIControl`](ui-control.md) and [`UIView`](ui-view.md).

| Method | Description |
| --- | --- |
| [`setOn()`](ui-switch/seton.md) | Toggles the switch, optionally animated |

## Events

The switch's events are inherited from [`UIControl`](ui-control.md); listen with `addEventListener()`. The one a switch uses is:

| Event | When it fires |
| --- | --- |
| [`change`](ui-control/change-event.md) | The user toggles the switch to the other side. Writing `isOn` or calling `setOn()` in code doesn't fire it |

## Examples

### A settings row

Starting from a blank app, put a "Notifications" row with a switch on screen.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.text = 'Notifications';

  const sw = new UISwitch();
  sw.isOn = true;
  sw.addEventListener('change', () => {
    console.log('notifications', sw.isOn ? 'on' : 'off');
  });

  const row = new UIStackView([label, sw]);
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

- "Notifications" appears near the top left of the screen, with a green switch that is on to its right.
- Tap the switch: the thumb slides to the left, the track turns gray, and the console prints `notifications off`.
- Tap it again, and the console prints `notifications on`.

`safeAreaLayoutGuide` is the area of the view controller not covered by the notch and rounded corners; see [Auto Layout](auto-layout.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UISwitch alloc] init]` | `new UISwitch()` |
| `sw.on` / `sw.isOn` | `sw.isOn` |
| `[sw setOn:YES animated:YES]` | `sw.setOn(true, { animated: true })` |
| `sw.onTintColor = UIColor.systemPurpleColor` | `sw.onTintColor = 'systemPurple'` |
| `[sw addTarget:self action:@selector(changed:) forControlEvents:UIControlEventValueChanged]` | `sw.addEventListener('change', fn)` |

## See also

- [Building switches, sliders, and steppers](../guides/switches-sliders-steppers.md): animated toggling, disabling, reverting when saving fails
- [`UIControl`](ui-control.md): `isEnabled` and all control events
- [`UIStackView`](ui-stack-view.md): put the text and switch in a row
- [Colors](ui-color.md): how to write color strings
