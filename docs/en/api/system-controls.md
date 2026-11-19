---
type: reference
native: UIColorWell
status: partial
---

# `UIColorWell`

**`UIColorWell`** represents a color well: a small round button showing the current color. When the user taps it, the system presents a color picker panel where the user chooses a color. Read the chosen color from [`selectedColor`](system-controls/selectedcolor.md).

The color picker panel is provided by the system; the app doesn't draw it and can only use a few properties to decide what's on it: the title, whether opacity can be adjusted, and whether there's an eyedropper (a tool for picking a color from the screen).

A color well is a [control](ui-control.md): enabling, state, and events come from `UIControl`. A control is in turn a [view](ui-view.md): position and size come from `UIView`.

The default values on this page and its member pages were measured in the simulator (iPhone Air, iOS 27.2). The panel has been opened and inspected in the simulator: its title is `title`, its current color is `selectedColor`, and when `supportsAlpha` and `supportsEyedropper` are `true` it has an opacity slider and an eyedropper button. **Whether `selectedColor` changes and whether [`change`](ui-control/change-event.md) fires after the user picks a color in the panel is not verified in the simulator.**

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UIColorWell`

## Constructor

[`UIColorWell()`](system-controls/constructor.md)

Creates a color well with no title and no selected color.

## Instance properties

Also inherits properties from [`UIControl`](ui-control.md) and [`UIView`](ui-view.md). A commonly used inherited property for color wells is `isEnabled`.

| Property | Description |
| --- | --- |
| [`selectedColor`](system-controls/selectedcolor.md) | The selected color |
| [`title`](system-controls/title.md) | The title of the color picker panel |
| [`supportsAlpha`](system-controls/supportsalpha.md) | Whether opacity can be adjusted in the panel |
| [`supportsEyedropper`](system-controls/supportseyedropper.md) | Whether the panel has an eyedropper |
| [`maximumLinearExposure`](system-controls/maximumlinearexposure.md) | The maximum linear exposure of colors selectable in the panel |

## Instance methods

`UIColorWell` has no methods of its own. It inherits the methods of [`UIControl`](ui-control.md) and [`UIView`](ui-view.md).

## Events

All of the color well's events are inherited from [`UIControl`](ui-control.md); listen with `addEventListener()`.

| Event | When it fires |
| --- | --- |
| [`change`](ui-control/change-event.md) | The user picked a color in the panel. **Not verified in the simulator.** Writing `selectedColor` in code doesn't fire it |

## Examples

### Adding a color well

Starting from a blank app, place a color well in the center of the screen.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const well = new UIColorWell();
  well.title = 'Pick a color';
  well.selectedColor = 'systemOrange';
  well.addEventListener('change', () => {
    console.log('Picked', well.selectedColor);
  });

  well.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(well);
  NSLayoutConstraint.activateConstraints([
    well.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    well.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    well.widthAnchor.constraintEqualToConstant(44),
    well.heightAnchor.constraintEqualToConstant(44),
  ]);
});
```

**Effect**

- A 44 × 44 [pt](units.md) color well appears in the center of the screen.
- Tapping it makes the system present the color picker panel, titled "Pick a color", with orange as the current color, an opacity slider, and an eyedropper button.
- Picking a color in the panel prints `Picked` and the color to the console. **Not verified in the simulator.**

This code hasn't been run as a whole in the simulator. Placing it on screen and opening the panel have been run in the acceptance tests.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIColorWell alloc] init]` | `new UIColorWell()` |
| `well.title = @"Pick a color"` | `well.title = 'Pick a color'` |
| `well.selectedColor = UIColor.systemOrangeColor` | `well.selectedColor = 'systemOrange'` |
| `well.supportsAlpha = NO` | `well.supportsAlpha = false` |
| `well.supportsEyedropper = NO` | `well.supportsEyedropper = false` |
| `well.maximumLinearExposure = 2` | `well.maximumLinearExposure = 2` |
| `[well addTarget:self action:@selector(picked:) forControlEvents:UIControlEventValueChanged]` | `well.addEventListener('change', picked)` |

## See also

- [`UIControl`](ui-control.md): the parent class; the `change` event and disabling
- [Colors](ui-color.md): the color strings `selectedColor` reads and writes
