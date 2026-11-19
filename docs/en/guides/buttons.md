# Building a button

This guide shows how to build common buttons with [`UIButton`](../api/ui-button.md): creating them, responding to taps, changing the appearance, disabling, and adding images. Details of each property and method are on the [`UIButton`](../api/ui-button.md) reference page.

## Recommended approach

- **Create buttons with [`UIButton.buttonWithType('system')`](../api/ui-button/buttonwithtype.md).** A `system` button comes with an appearance that fades while pressed and grays out when disabled, with no extra code. For a button whose appearance is entirely your own, use [`new UIButton()`](../api/ui-button/constructor.md); the cost is that you set the title color and the pressed look yourself.
- **Listen for taps with `click`.** `click` means "the button was triggered". `touchupinside` (the finger lifted inside the button) also fires on a tap; pick one of the two, because if you listen to both, one tap runs your code twice. When you need the touch location, use `touchupinside`: its event object carries `location`, and `click`'s doesn't.
- **The tappable area is the button's area.** A button with a short title is only as big as its title, which is hard to hit. Apple recommends a tappable area of at least 44 × 44 pt; for how, see [Enlarging the tap area to 44 pt](#enlarging-the-tap-area-to-44-pt).

## First button

Starting from a blank app, place a button in the center of the screen that prints a line to the console when tapped.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and the page. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create the button
  const button = UIButton.buttonWithType('system');

  // 2. Set the button's title
  button.setTitle('Tap me', { forState: ['normal'] });

  // 3. What to do on tap
  button.addEventListener('click', () => {
    console.log('Button tapped');
  });

  // 4. Put it on the page, centered
  button.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(button);
  NSLayoutConstraint.activateConstraints([
    button.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    button.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);
});
```

**Effect**

- The blue words "Tap me" appear in the center of the screen, with no border and no background.
- While a finger presses it, the title fades; it returns on release.
- When the finger lifts on the button, the console prints `Button tapped`.
- If the finger touches down, slides outside the button, and then lifts, nothing is printed.

This code has not been run as a whole in the simulator. Each API it uses has been run in the acceptance tests.

The four steps are: create, set the title, listen for taps, and put it on the page. Each usage below modifies these four steps and reuses the two variables `button` and `page`. To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const button = UIButton.buttonWithType('system');
page.view.addSubview(button);
```

## Why a new button is invisible

A new button has no title and no size. When a button doesn't show up, it is usually for one of these reasons:

| Cause | Fix |
| --- | --- |
| No title or image set | Call [`setTitle()`](../api/ui-button/settitle.md) or [`setImage()`](../api/ui-button/setimage.md) |
| A button created with `new UIButton()` has a white title on a light background | Call [`setTitleColor()`](../api/ui-button/settitlecolor.md). **The default white is not verified in the simulator** |
| Positioned with `frame` but no width and height given, so they are 0 | Give it a width and height, or call `sizeToFit()` to let the button size itself to its content |
| Not added to the page | Call `addSubview()` |

When positioning with Auto Layout, you don't need to give a width and height: the button sizes itself from its title and image, and you only constrain its position.

## What counts as a tap

A finger touching down on the button and then lifting inside the button's area counts as one tap, and the button fires `click` once.

- **Touching down, sliding outside the button, and then lifting is not a tap.** `click` doesn't fire. **Not verified in the simulator.**
- **Two quick taps are two taps.** The callback runs twice; the button doesn't merge consecutive taps. For how to avoid running twice, see [Preventing duplicate submissions](#preventing-duplicate-submissions). Measured, both touch-downs fired events when tapping twice in a row; `click` firing twice is **not verified in the simulator**.
- **A disabled button doesn't respond to touches.** When `isEnabled` is `false`, tapping does nothing and no event fires. **Not verified in the simulator.**
- **The callback doesn't run at the instant the finger lifts.** It runs after the current turn of code; see [When callbacks run](../api/ui-control.md#when-callbacks-run).
- **An exception thrown in the callback doesn't affect the button.** The exception fires `error` on [`application`](../api/application.md), other callbacks for the same event still run, and the button can still be tapped afterward.

## Preventing duplicate submissions

For an action that should run only once, such as submitting an order, use a variable in the callback to remember "in progress" and disable the button at the same time.

```js
let submitting = false;
button.addEventListener('click', () => {
  if (submitting) return;
  submitting = true;
  button.isEnabled = false;
  console.log('Submitting');
  // When submission finishes: submitting = false; button.isEnabled = true;
});
```

**Effect**: The first tap prints `Submitting` and the button becomes disabled; later taps print nothing. **Not verified in the simulator.**

You need both. The callback runs only after the tap, so a second tap may already be waiting to run before the button is disabled; the variable handles that. Disabling the button lets the user see that it can't be tapped right now.

## Changing the title color

```js
button.setTitleColor('#FF3B30', { forState: ['normal'] });
```

**Effect**: The title turns red. It still fades automatically while pressed.

The color can be written as `'#RRGGBB'` or as a system color name such as `'systemRed'`; see [Colors](../api/ui-color.md).

## Adding a background color and rounded corners

The background color and corner radius are properties the button has as a view.

```js
button.backgroundColor = '#007AFF';
button.layer.cornerRadius = 10;
button.setTitleColor('white', { forState: ['normal'] });

NSLayoutConstraint.activateConstraints([
  button.widthAnchor.constraintEqualToConstant(200),
  button.heightAnchor.constraintEqualToConstant(44),
]);
```

**Effect**: A blue rounded rectangle 200 pt wide and 44 pt tall, with a corner radius of 10 pt and a white title in the middle.

Without a width and height, the button is only as big as its title, and the background hugs the text.

## Enlarging the tap area to 44 pt

When the size the button computes from its content is smaller than 44 × 44 pt, add two "at least" constraints:

```js
NSLayoutConstraint.activateConstraints([
  button.widthAnchor.constraintGreaterThanOrEqualToConstant(44),
  button.heightAnchor.constraintGreaterThanOrEqualToConstant(44),
]);
```

**Effect**: The button's width and height are both at least 44 pt. With a longer title, the button still widens to fit it. **Not verified in the simulator.**

## Changing the font and size

The button itself has no font property. The title is displayed by a [`UILabel`](../api/ui-label.md) inside the button; get it through [`titleLabel`](../api/ui-button/titlelabel.md) and set it there.

```js
const label = button.titleLabel;
if (label) {
  label.font = UIFont.systemFontOfSize(20, { weight: 'semibold' });
}
```

**Effect**: The title becomes 20 pt semibold.

> **Note:** Don't change the title text or color through `titleLabel`; use `setTitle()` and `setTitleColor()`. If you change `titleLabel.text` directly, the button switches it back the next time its state changes.

## A different title and color while pressed

Set a separate set for the `highlighted` state.

```js
button.setTitle('Tap me', { forState: ['normal'] });
button.setTitle('Let go!', { forState: ['highlighted'] });
button.setTitleColor('#FF3B30', { forState: ['highlighted'] });
```

**Effect**: It normally shows "Tap me". While a finger presses it, it shows a red "Let go!"; on release it goes back to "Tap me".

## Disabling a button

```js
button.isEnabled = false;
```

**Effect**: The title turns gray and tapping does nothing. Set it back to `true` to restore it. **"The title turns gray" and "tapping does nothing" are not verified in the simulator.**

To show a different title while disabled, set it for the `disabled` state:

```js
button.setTitle('Submit', { forState: ['normal'] });
button.setTitle('Fill in the form first', { forState: ['disabled'] });
```

**Effect**: When `isEnabled` is `false`, it shows "Fill in the form first".

## Adding an image

```js
button.setImage(UIImage.systemImageNamed('heart.fill'), { forState: ['normal'] });
```

**Effect**: A heart icon appears to the left of the title, in the same color as the title. If you set only an image and no title, the button has only the image. **The image's position and color are not verified in the simulator.**

`'heart.fill'` is a name from SF Symbols, the system's built-in icon library. For your own images, see [`UIImage`](../api/ui-image.md).

## A toggle button

For a button that toggles with each tap, like "Follow / Following", use the `selected` state. The system doesn't change this state automatically; toggle it yourself in the tap callback.

```js
const follow = UIButton.buttonWithType('system');
follow.setTitle('Follow', { forState: ['normal'] });
follow.setTitle('Following', { forState: ['selected'] });
follow.setTitleColor('#8E8E93', { forState: ['selected'] });

follow.addEventListener('click', () => {
  follow.isSelected = !follow.isSelected;
});
```

**Effect**: It initially shows "Follow". Tap once and it becomes a gray "Following"; tap again and it changes back. **Not verified in the simulator.**

## Delete-style buttons

```js
button.role = 'destructive';
```

**Effect**: The title is shown in red, indicating an irreversible action. **Not verified in the simulator.**

## See also

- [`UIButton`](../api/ui-button.md): all properties, methods, and states
- [`UIControl`](../api/ui-control.md): all events, touch locations, when callbacks run
- [Auto Layout](../api/auto-layout.md): the button's position and size
