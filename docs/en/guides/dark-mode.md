# Supporting Dark Mode

This guide covers how to make the UI follow light and Dark Mode: when colors alone are enough, how to tell the current appearance, how to build a theme switch in the app, and how to make colors and font sizes on layers follow along. It uses [`UITraitCollection`](../api/ui-trait-collection.md), along with `traitCollection`, `overrideUserInterfaceStyle`, and the `traitchange` event on views, view controllers, and scenes; the details are all on the [`UITraitCollection`](../api/ui-trait-collection.md) reference page. For how to write colors, see [Setting colors](colors.md).

## Recommended approach

- **Use semantic colors; do not check light or dark in code and then set colors.** Semantic colors are switched automatically by the system, with no events to listen for and no risk of missing a view.
- **Put the theme switch on the window, and save the user's choice.** Setting it on the window covers the whole app at once, and newly created view controllers and views follow automatically. `overrideUserInterfaceStyle` is not saved, and it goes back to `'unspecified'` after the app relaunches, so save the choice in [storage](../api/storage.md) and write it again at launch. For the code, see [Building a theme switch in the app](#building-a-theme-switch-in-the-app).
- **Put code that needs the new values in the `traitchange` callback.** Whether the change comes from system settings or from `overrideUserInterfaceStyle`, `traitCollection` already holds the new values when the callback runs. Write "update the UI for the current appearance" as one function, call it once when building the UI, and call it again in the callback, so both paths go through the same code.
- **Listen at the level closest to what needs updating.** When a view is forced to dark, what changes is its own appearance, and the event fires on it. Listening on that view catches both kinds of change: system switches and forcing.
- **Read the screen scale from `traitCollection.displayScale`; do not hard-code 3.** Even a view not yet added to the UI reads the correct value.

## When you need to write code

**Just making colors follow light and dark requires neither reading traits nor listening for `traitchange`.** Once a view's colors are written as semantic colors (such as `'label'` or `'systemBackground'`) or with `light-dark()`, the system swaps in the corresponding colors automatically when switching between light and dark, and the app's code does nothing; see [Setting colors](colors.md).

Cases where you need this page:

- Dark and light need different images or different layouts, which code has to decide.
- Building a theme switch in the app that does not follow the system.
- The user increased the system text size, and the layout needs to adjust.
- [Layers](../api/ca-layer.md) you create yourself need to be drawn at the screen's scale.
- Colors on layers (border colors, shadow colors, and so on) need to follow light and dark. Colors on layers are not swapped automatically; see [Making a layer's border color follow light and dark](#making-a-layers-border-color-follow-light-and-dark).

## First example

Starting from a blank app, show whether the current appearance is dark or light, and place a button that switches the whole app to dark.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.frame = new CGRect(40, 120, 300, 30);
  label.textColor = 'label';
  page.view.addSubview(label);

  // 1. Read whether it is dark or light right now
  function show() {
    label.text = 'Now: ' + page.view.traitCollection.userInterfaceStyle;
  }
  show();

  // 2. Read it again whenever it changes
  page.view.addEventListener('traitchange', show);

  // 3. A button: force the whole window to dark
  const button = UIButton.buttonWithType('system');
  button.setTitle('Switch to dark', { forState: ['normal'] });
  button.frame = new CGRect(40, 170, 120, 44);
  page.view.addSubview(button);
  button.addEventListener('touchupinside', () => {
    win.overrideUserInterfaceStyle = 'dark';
  });
});
```

**Effect**:

- When the system is light, the screen has a white background with a line of black text, "Now: light", and below it a text button, "Switch to dark".
- Tap the button: the whole screen turns black, the text turns white, and the line reads "Now: dark".

This code has not been run as a whole in the simulator. Reading, forcing on a view, and the event have each been checked in the acceptance tests. That the whole screen follows when forced on the window is **not verified in the simulator**: the acceptance tests have such a button, but no assertion.

`'systemBackground'` and `'label'` are semantic colors; the system swaps the background and text colors automatically. The code is responsible only for the content of that line of text.

`show()` is called once when the UI is built, and is also registered as the `traitchange` callback. After the button is tapped there is no need to call it manually: the window is forced to dark, the view controller's view is inside the window, its appearance changes along with it, and so it receives `traitchange`.

The following examples all reuse `win` and `page` from here. To try a section on its own, write these lines first:

```js
const win = new UIWindow();
const page = new UIViewController();
win.rootViewController = page;
```

## Checking whether it is dark right now

```js
const dark = page.view.traitCollection.userInterfaceStyle === 'dark';
console.log(dark ? 'Dark' : 'Light');
```

**Effect**: Prints `Dark` when this view is displayed in dark, and `Light` otherwise.

The `userInterfaceStyle` read from `traitCollection` was measured to have only two values, `'light'` and `'dark'`, so anything other than `'dark'` is light.

This check reflects only the moment of reading. To keep updating as it changes, listen for `traitchange`; see the next section.

## Knowing when the system switches between light and dark

When the user switches in system settings, `traitchange` fires on the [scene](../api/ui-window-scene.md). Get the scene from the `sceneconnect` event; below it is called `scene`:

```js
application.addEventListener('sceneconnect', (e) => {
  const scene = e.scene;
  scene.addEventListener('traitchange', (event) => {
    const before = event.previousTraitCollection;
    console.log(before.userInterfaceStyle + ' → ' + scene.traitCollection.userInterfaceStyle);
  });
});
```

**Effect**: When the system switches from light to dark, the console prints `light → dark`. Switching back prints `dark → light`.

To switch in the simulator: menu Features → Toggle Appearance.

Listening on the scene catches changes to the system setting. When a view or window changes because it was forced with `overrideUserInterfaceStyle`, the scene's value does not change, so listen on that view. That the scene indeed does not fire when a view is forced is **not verified in the simulator**. Listening on a view also catches changes to the system setting (measured: a view in the UI and the scene each received it once); but when that view has already been forced to a fixed appearance, it does not change however the system switches, and whether it still fires is **not verified in the simulator**.

## Building a theme switch in the app

Set `overrideUserInterfaceStyle` on the window, and all the UI in the window follows:

```js
win.overrideUserInterfaceStyle = 'dark';          // always dark
win.overrideUserInterfaceStyle = 'light';         // always light
win.overrideUserInterfaceStyle = 'unspecified';   // follow the system
```

**Effect**: The three lines respectively make the whole app always dark, always light, or follow the system setting again. **Not verified in the simulator**: forcing on a view has assertions, but forcing on the window has only a manually tapped button.

`overrideUserInterfaceStyle` is not saved; after the app relaunches it is `'unspecified'`. Save the user's choice in [storage](../api/storage.md) and write it again at launch:

```js
/** @param {UIUserInterfaceStyle} style */
function setTheme(style) {
  win.overrideUserInterfaceStyle = style;
  application.storage.set('theme', style);
}

// Restore the last choice at launch. If nothing was saved, do not force; follow the system
const saved = application.storage.stringForKey('theme');
if (saved === 'dark' || saved === 'light') {
  win.overrideUserInterfaceStyle = saved;
}

setTheme('dark');
```

**Effect**: The whole app switches to dark. At the next launch, the restoring lines fix the window to dark again. Put the restoring lines in the `sceneconnect` callback, before `makeKeyAndVisible()`. **This example is not verified in the simulator.**

The switch's three options map to three values: "Dark" writes `'dark'`, "Light" writes `'light'`, and "Follow system" writes `'unspecified'`.

## Making only one area dark

```js
const panel = new UIView();
panel.frame = new CGRect(20, 240, 280, 120);
panel.backgroundColor = 'systemBackground';
panel.overrideUserInterfaceStyle = 'dark';
page.view.addSubview(panel);
```

**Effect**: A black rectangle appears on the view controller. When the system is light, the rest of the view controller stays white; only this area and its contents use dark.

`UIViewController` also has `overrideUserInterfaceStyle`; set on a view controller, it applies to the whole view controller:

```js
const player = new UIViewController();
player.overrideUserInterfaceStyle = 'dark';
console.log(player.view.traitCollection.userInterfaceStyle);
```

**Effect**: Prints `dark`. This view controller is displayed in dark whether the system is dark or light. The view controller's view is created the first time `player.view` is read, and it carries the view controller's setting when created, so the new value is read immediately here.

## Reading the screen's scale

```js
const scale = page.view.traitCollection.displayScale;
console.log(scale);
console.log(1 / scale);
```

**Effect**: In the iPhone Air simulator, prints `3` and `0.3333333333333333`.

`displayScale` is how many pixels 1 [pt](../api/units.md) corresponds to. Two common uses:

- To draw a line 1 pixel wide, write the width as `1 / scale` pt.
- For [layers](../api/ca-layer.md) you create yourself to be drawn sharply, set their `contentsScale` to this value.

## Adjusting to the text size the user set

```js
const size = page.view.traitCollection.preferredContentSizeCategory;
const large = size.startsWith('accessibility');
console.log(size, large ? 'use a single-column layout' : 'use a two-column layout');
```

**Effect**: When the user has not changed the text size, prints `large use a two-column layout`. When the user sets the text to one of the largest sizes in Accessibility in system settings, prints something like `accessibilityLarge use a single-column layout`. The sizes starting with `accessibility` are **not verified in the simulator**; the largest size switched to in the simulator was `extraExtraLarge`.

When the user changes the text size while the app is running, `traitchange` fires. For the text itself to get bigger, get the font again in the callback:

```js
const body = new UILabel();
body.frame = new CGRect(20, 480, 280, 60);
body.text = 'Body text';
page.view.addSubview(body);

function applyFont() {
  body.font = UIFont.preferredFontForTextStyle('body');
}
applyFont();

body.addEventListener('traitchange', applyFont);
```

**Effect**: The text is displayed at the system's current text size. When the user changes the text size in system settings and returns to the app, this line of text switches to the new size.

That `traitchange` fires when the text size changes has been checked in the simulator. That the size actually changes after getting the font again in the callback is **not verified in the simulator**.

Get the font with [`UIFont.preferredFontForTextStyle()`](../api/ui-font/preferredfontfortextstyle.md); the size it returns depends on the current setting. `UIFont.systemFontOfSize(17)` is always 17 pt and does not change when gotten again. A font already set on a label does not change by itself, so assign it again in the callback.

To change the text size in the simulator: run `xcrun simctl ui booted content_size extra-extra-large` in Terminal.

## Making a layer's border color follow light and dark

Colors on a [layer](../api/ca-layer.md) are fixed at the moment they are written and do not change by themselves when switching between light and dark. Write them again in `traitchange`:

```js
const card = new UIView();
card.frame = new CGRect(20, 380, 280, 80);
card.layer.borderWidth = 1;
card.layer.borderColor = 'separator';
page.view.addSubview(card);

card.addEventListener('traitchange', () => {
  card.layer.borderColor = 'separator';
});
```

**Effect**: The card has a thin border. After the system switches between light and dark, the border changes to the separator color for the new appearance. Without the last three lines, the border stays at the color from before the switch.

Whose appearance is used at the moment of writing:

| Layer | Whose appearance |
| --- | --- |
| A view's own layer (`view.layer`) | That view's. If the view is forced to dark, what is written is the dark color |
| A sublayer you created, attached under some view's layer | That of the view it is attached to |
| A layer not yet attached to any view | The system's appearance at the time. It is not recomputed after being attached; write it again yourself |

Border colors, shadow colors, layer background colors, shape layers' fill and stroke colors, and gradient layers' color arrays all follow this rule.

## See also

- [`UITraitCollection`](../api/ui-trait-collection.md): all trait properties, and the rules for forcing and events
- [Setting colors](colors.md): semantic colors and `light-dark()`
- [`UIColor`](../api/ui-color.md): why colors on layers do not change by themselves
- [`UIWindow`](../api/ui-window.md): the theme switch goes on it
- [`UIFont`](../api/ui-font.md): font sizes that follow the system text size
- [Storage](../api/storage.md): saving the theme the user chose
