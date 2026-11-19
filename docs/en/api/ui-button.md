---
type: reference
native: UIButton
status: partial
---

# `UIButton`

**`UIButton`** represents a button: a tappable area on screen that displays a title, an image, or both. When the user taps the button, it fires the [`click`](ui-control/click-event.md) event.

A button's title, title color, image, and background image are set per [state](#states), and the button displays the set for its current state.

A button is a [control](ui-control.md): enabling, state, and events come from `UIControl`. A control is in turn a [view](ui-view.md): position, size, background color, and corner radius come from `UIView`.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → [`UIControl`](ui-control.md) → `UIButton`

For how to build a working button, see the guide [Building a button](../guides/buttons.md).

## Constructor

[`UIButton()`](ui-button/constructor.md)

Creates a button of type `custom`. The system gives it no default appearance.

## Static methods

[`UIButton.buttonWithType()`](ui-button/buttonwithtype.md)

Creates a button of the given type. For an ordinary text button, use `'system'`.

## Instance properties

Also inherits properties from [`UIControl`](ui-control.md) and [`UIView`](ui-view.md). Inherited properties commonly used with buttons are `isEnabled`, `isSelected`, `backgroundColor`, and `layer`.

| Property | Description |
| --- | --- |
| [`buttonType`](ui-button/buttontype.md) <small>read-only</small> | The button's type, fixed at creation |
| [`role`](ui-button/role.md) | The button's purpose. The system adjusts the appearance based on it |
| [`currentTitle`](ui-button/currenttitle.md) <small>read-only</small> | The title the button is displaying right now |
| [`currentTitleColor`](ui-button/currenttitlecolor.md) <small>read-only</small> | The button's title color right now |
| [`currentImage`](ui-button/currentimage.md) <small>read-only</small> | The image the button is displaying right now |
| [`currentBackgroundImage`](ui-button/currentbackgroundimage.md) <small>read-only</small> | The background image the button is displaying right now |
| [`currentAttributedTitle`](ui-button/currentattributedtitle.md) <small>read-only</small> | The styled title the button is displaying right now |
| [`titleLabel`](ui-button/titlelabel.md) <small>read-only</small> | The `UILabel` that displays the title. Use it to set the font and number of lines |
| [`imageView`](ui-button/imageview.md) <small>read-only</small> | The `UIImageView` that displays the image |

## Instance methods

Also inherits methods from [`UIControl`](ui-control.md) and [`UIView`](ui-view.md).

The setter methods all take `{ forState }` and set a value for one or more states:

| Method | Description |
| --- | --- |
| [`setTitle()`](ui-button/settitle.md) | Sets the title |
| [`setTitleColor()`](ui-button/settitlecolor.md) | Sets the title color |
| [`setImage()`](ui-button/setimage.md) | Sets the image, shown to the left of the title |
| [`setBackgroundImage()`](ui-button/setbackgroundimage.md) | Sets the background image, which fills the whole button |
| [`setAttributedTitle()`](ui-button/setattributedtitle.md) | Sets a styled title |

The getter methods each read one state:

| Method | Description |
| --- | --- |
| [`titleForState()`](ui-button/titleforstate.md) | The title for a state |
| [`titleColorForState()`](ui-button/titlecolorforstate.md) | The title color for a state |
| [`imageForState()`](ui-button/imageforstate.md) | The image for a state |
| [`backgroundImageForState()`](ui-button/backgroundimageforstate.md) | The background image for a state |
| [`attributedTitleForState()`](ui-button/attributedtitleforstate.md) | The styled title for a state |

## Events

A button's events are all inherited from [`UIControl`](ui-control.md#events); listen with `addEventListener()`. These are the ones buttons commonly use:

| Event | When it fires |
| --- | --- |
| [`click`](ui-control/click-event.md) | The user completed a tap. Use this to respond to taps |
| [`touchdown`](ui-control/touchdown-event.md) | A finger just touched down |
| [`touchupinside`](ui-control/touchupinside-event.md) | The finger lifted inside the button |
| [`touchupoutside`](ui-control/touchupoutside-event.md) | The finger touched down, slid outside the button, and lifted |
| [`touchcancel`](ui-control/touchcancel-event.md) | The system interrupted the touch, for example an incoming call |

For all 16 events, what the event object carries, and when callbacks run, see [`UIControl`](ui-control.md#events).

## States

At any moment a button is in one or more states. The methods that set titles, colors, and images use `forState` to specify which states to set.

| State | When the button is in it | Who switches it |
| --- | --- | --- |
| `normal` | When none of the others apply | — |
| `highlighted` | A finger is pressing the button | The system |
| `disabled` | `isEnabled` is `false` | The app's code |
| `selected` | `isSelected` is `true` | The app's code |
| `focused` | The button has received focus. **When it receives focus is not verified in the simulator** | The system |

- States that haven't been set separately use the `normal` set. So most buttons only set `normal`.
- Several states can hold at once, for example selected and disabled. For a value used only in that combination, write `forState` as `['selected', 'disabled']`.
- Read the current state from the inherited [`state`](ui-control.md#states) property, which returns an array of state names.

## Examples

### A button in the center of the screen

Starting from a blank app, place a button in the center of the screen that prints a line to the console when tapped.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('Tap me', { forState: ['normal'] });
  button.addEventListener('click', () => {
    console.log('Button tapped');
  });

  button.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(button);
  NSLayoutConstraint.activateConstraints([
    button.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    button.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);
});
```

**Effect**

- A blue "Tap me" appears in the center of the screen, with no border or background.
- While a finger presses it, the title fades; it returns on release.
- Tap it once and the console prints `Button tapped`.

This code has not been run as a whole in the simulator. Each API it uses has been run in the acceptance tests.

### Different titles per state

```js
const follow = UIButton.buttonWithType('system');
follow.setTitle('Follow', { forState: ['normal'] });
follow.setTitle('Following', { forState: ['selected'] });

follow.addEventListener('click', () => {
  follow.isSelected = !follow.isSelected;
});
```

**Effect**: It initially shows "Follow"; tap once and it becomes "Following"; tap again and it changes back. **Not verified in the simulator.**

For more patterns, see the guide [Building a button](../guides/buttons.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIButton buttonWithType:UIButtonTypeSystem]` | `UIButton.buttonWithType('system')` |
| `[btn setTitle:@"Tap me" forState:UIControlStateNormal]` | `btn.setTitle('Tap me', { forState: ['normal'] })` |
| `[btn setTitle:@"x" forState:UIControlStateSelected \| UIControlStateDisabled]` | `btn.setTitle('x', { forState: ['selected', 'disabled'] })` |
| `[btn titleForState:UIControlStateHighlighted]` | `btn.titleForState('highlighted')` |
| `[btn addTarget:self action:@selector(tap) forControlEvents:UIControlEventPrimaryActionTriggered]` | `btn.addEventListener('click', tap)` |
| `btn.role = UIButtonRoleDestructive` | `btn.role = 'destructive'` |
| `btn.enabled = NO` | `btn.isEnabled = false` |

## See also

- [Building a button](../guides/buttons.md): creating, tapping, preventing duplicate submissions, appearance, disabling, images
- [`UIControl`](ui-control.md): all events and states
- [`UILabel`](ui-label.md): the type of `titleLabel`
- [Attributed strings](ns-attributed-string.md)
