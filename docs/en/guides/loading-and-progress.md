# Showing loading and progress

This guide covers how to tell the user that "something is in progress": use a spinner, [`UIActivityIndicatorView`](../api/ui-activity-indicator-view.md), when you do not know how long it will take, and a progress bar, [`UIProgressView`](../api/ui-progress-view.md), when you know how much is done. The details of each property and method are on the reference pages of these two classes.

## Recommended approach

- **Use a progress bar when you know the progress; use a spinner only when you do not.** For tasks where you can calculate how much is done (uploading photo 3 of 10), use a progress bar so the user can see how much longer to wait.
- **Position them with Auto Layout.** Constrain only a spinner's position; it gives its own size based on its style. Constrain a progress bar's left and right edges so it widens when the screen width changes; do not constrain its height.
- **Create a spinner once and reuse it.** Create it and add it to the page when building the interface, and afterward call only [`startAnimating()`](../api/ui-activity-indicator-view/startanimating.md) and [`stopAnimating()`](../api/ui-activity-indicator-view/stopanimating.md) for each wait. The spinner shows and hides itself; you do not need to write `isHidden`.
- **Put `stopAnimating()` in `finally`.** It must stop even when what you are waiting for fails; otherwise the spinner stays on screen and the user thinks it is still loading.
- **Use `setProgress(value, { animated: true })` when progress moves forward, and no animation when going back to 0.** Going from 1 back to 0 with animation makes the user see the bar run backward.
- **Keep track of how much is done yourself; the progress bar only displays it.** Keep the number done and the total in your own variables, and on each update compute the ratio and write it to the progress bar. Do not read `bar.progress` back and add to it; the value read back has 32-bit floating-point error.
- **Hide or remove the progress bar when the task is done.** A progress bar does not disappear on its own when it reaches 1.

Neither spinners nor progress bars block the interface: while they are shown, buttons on the page can still be tapped and text fields can still be typed in. To stop the user from repeating an action while waiting, the app must disable the button itself; see [Disabling a button while waiting](#disabling-a-button-while-waiting).

## First example

Starting from a blank app, put a spinner in the center of the screen and a progress bar above it. The progress bar advances one step every half second, and the spinner stops when it is full.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Create a spinner, the large kind, in the center. No width or height needed
  const spinner = new UIActivityIndicatorView();
  spinner.activityIndicatorViewStyle = 'large';
  spinner.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(spinner);

  // 2. Create a progress bar, 24 pt from each side and 40 pt below the top of the safe area. No height needed
  const bar = new UIProgressView();
  const safe = page.view.safeAreaLayoutGuide;
  bar.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(bar);

  NSLayoutConstraint.activateConstraints([
    spinner.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    spinner.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    bar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 24 }),
    bar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -24 }),
    bar.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 40 }),
  ]);

  // 3. Start spinning. This also shows it
  spinner.startAnimating();

  // 4. Complete one step every half second, 10 steps in all; when full, stop the spinner, which also hides it
  const total = 10;
  let done = 0;
  const timer = setInterval(() => {
    done += 1;
    bar.setProgress(done / total, { animated: true });
    if (done === total) {
      clearInterval(timer);
      spinner.stopAnimating();
      console.log('Done');
    }
  }, 500);
});
```

**Effect**

- A 37 × 37 pt gray spinner appears in the center of the screen, spinning continuously.
- Near the top of the page is a 4 pt tall light line; every half second, the blue part on its left grows by one step.
- After five seconds the progress bar is full, the spinner disappears, and the console prints `Done`.

This code has not been run as a whole in the simulator.

The sections below reuse `page`, `spinner`, and `bar` from here. To try a section on its own, first write these lines:

```js
const page = new UIViewController();
const spinner = new UIActivityIndicatorView();
page.view.addSubview(spinner);
const bar = new UIProgressView();
page.view.addSubview(bar);
```

## Why a new spinner is invisible

A new spinner is hidden and has no size.

- **It is hidden.** By default a spinner hides itself when it is not spinning, and a new spinner has not started spinning. After `startAnimating()` is called, it shows itself.
- **Its `frame` is 0 × 0.** A spinner has a size it wants: 20 × 20 pt for `'medium'` and 37 × 37 pt for `'large'`. When positioned with Auto Layout it takes this size automatically; when positioned with `frame`, call `sizeToFit()` once; see [Placing a spinner with `frame`](#placing-a-spinner-with-frame).
- **It must be added to the page.** Like other views, call `addSubview()`.

## Why a new progress bar is invisible

A new progress bar's `frame` is 0 wide and 4 pt tall; give it a width: with Auto Layout, constrain its left and right edges or its width; with `frame`, write a `frame` that gives the position and width.

A new progress bar's `progress` is 0, so the filled part has length 0, and only a light track shows on screen.

## Waiting for a network request

```js
async function load() {
  spinner.startAnimating();
  try {
    const response = await fetch('https://httpbin.org/delay/2');
    console.log('Status code', response.status);
  } catch (err) {
    console.log('Request failed', err instanceof Error ? err.message : err);
  } finally {
    spinner.stopAnimating();
  }
}
load();
```

**Effect**: The spinner appears when the request is sent and disappears when the request ends. It disappears whether the request succeeds or fails. **This example is not verified in the simulator.**

`stopAnimating()` goes in `finally`. If it were the last line of `try`, it would not run when the request fails.

## Disabling a button while waiting

```js
const submit = UIButton.buttonWithType('system');
submit.setTitle('Submit', { forState: ['normal'] });

submit.addEventListener('click', async () => {
  submit.isEnabled = false;
  spinner.startAnimating();
  try {
    await fetch('https://httpbin.org/delay/2');
  } finally {
    spinner.stopAnimating();
    submit.isEnabled = true;
  }
});
```

**Effect**: After tapping "Submit", the button is disabled and the spinner appears; when the request ends, the spinner disappears and the button is restored. Tapping the button again while waiting does nothing. **This example is not verified in the simulator.**

For how to put the button on the page, see [Building a button](buttons.md).

## Changing the spinner's size and color

```js
spinner.activityIndicatorViewStyle = 'medium';
spinner.color = '#FF3B30';
```

**Effect**: The size the spinner wants becomes 20 × 20 pt, and its color becomes red. A spinner positioned with Auto Layout takes this size at the next layout pass.

There are only two sizes, `'medium'` and `'large'`. A spinner positioned with `frame` does not follow along; call `sizeToFit()` again after changing the style.

The default color is `'secondaryLabel'`, a gray that changes with light and dark mode. For a white spinner on a dark background, write `'white'`. To restore the default color, write `null`:

```js
spinner.color = null;
console.log(spinner.color);
```

**Effect**: The spinner goes back to the default gray, and the console prints `secondaryLabel`.

## Keeping the spinner on screen after it stops

```js
spinner.hidesWhenStopped = false;
spinner.stopAnimating();
```

**Effect**: The spinner stops rotating but stays where it is, as a ring of still short lines.

Changing this property takes effect immediately. For a spinner that is not spinning, setting it to `false` shows it immediately, and setting it back to `true` hides it immediately.

## Placing a spinner with `frame`

```js
const corner = new UIActivityIndicatorView();
corner.sizeToFit();
corner.center = new CGPoint(40, 120);
page.view.addSubview(corner);
corner.startAnimating();
```

**Effect**: A 20 × 20 pt spinner with its center at (40, 120) on the page.

`sizeToFit()` changes the size of `frame` to the size the spinner wants. Without it, `frame` is 0 × 0.

## Placing a spinner next to a line of text

Put the spinner and the text into a [`UIStackView`](../api/ui-stack-view.md), which arranges them in a row.

```js
const label = new UILabel();
label.text = 'Saving';

const busy = new UIActivityIndicatorView();
const row = new UIStackView([busy, label]);
row.spacing = 8;
row.alignment = 'center';
row.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(row);
NSLayoutConstraint.activateConstraints([
  row.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
  row.topAnchor.constraintEqualToAnchor(page.view.safeAreaLayoutGuide.topAnchor, { constant: 24 }),
]);

busy.startAnimating();
```

**Effect**: A spinner appears centered at the top of the page, with "Saving" 8 pt to its right. After `busy.stopAnimating()` is called, the spinner disappears and only the text remains, centered on its own. **This example is not verified in the simulator.**

`UIStackView` does not leave space for hidden views, and a spinner hides itself when it stops, so the two work together without extra code.

## Setting progress directly

```js
bar.progress = 0.5;
```

**Effect**: The filled part immediately becomes half of the whole bar, with no animation.

For animation, use [`setProgress()`](../api/ui-progress-view/setprogress.md):

```js
bar.setProgress(0.8, { animated: true });
console.log(bar.progress);
```

**Effect**: The filled part slides to 80% of the bar. The console prints `0.800000011920929`: `progress` is the new value right away, not a value partway through the slide.

## Converting the number completed into progress

```js
const steps = 8;
let finished = 0;

function finishOne() {
  finished += 1;
  bar.setProgress(finished / steps, { animated: true });
}
finishOne();
finishOne();
```

**Effect**: After two calls, the filled part is a quarter of the bar.

## Showing a percentage alongside

```js
const percent = new UILabel();
percent.text = Math.round(bar.progress * 100) + '%';
```

**Effect**: When `progress` is 0.3, the text is `30%`.

`Math.round()` is required. `progress` is stored as a 32-bit floating-point number; `0.3` reads back as `0.30000001192092896`, and multiplying by 100 directly gives `30.000001192092896`.

The text must be set again after every progress change; the progress bar sends no notification.

## Changing the progress bar's colors

```js
bar.progressTintColor = 'systemGreen';
bar.trackTintColor = '#E5E5EA';
```

**Effect**: The filled part is green, and the unfilled part is light gray.

For how to write colors, see [Colors](../api/ui-color.md). Writing `null` restores the system default color.

## Changing the progress bar's thickness

The progress bar's height is determined by its style; **the height has no effect when writing `frame`**. For a thicker progress bar, add a height constraint:

```js
NSLayoutConstraint.activateConstraints([
  bar.heightAnchor.constraintEqualToConstant(10),
]);
```

**Effect**: The progress bar's height becomes 10 pt.

For a thinner progress bar, use the other style:

```js
bar.progressViewStyle = 'bar';
```

**Effect**: The progress bar becomes thinner, less than 4 pt tall. Measured on a 3x screen: 2.67 pt.

## Placing a progress bar with `frame`

```js
const fixed = new UIProgressView();
fixed.frame = new CGRect(24, 200, 240, 4);
page.view.addSubview(fixed);
fixed.progress = 0.4;
```

**Effect**: A progress bar 240 pt wide and 4 pt tall, with its top-left corner at (24, 200) on the page, 40% filled.

Whatever you write for the fourth argument of `CGRect` (the height) has no effect; the progress bar's height is always the value determined by its style.

## Hiding the progress bar when done

```js
bar.setProgress(1, { animated: true });
setTimeout(() => {
  bar.isHidden = true;
  bar.progress = 0;
}, 600);
```

**Effect**: The progress bar fills up, disappears 0.6 seconds later, and the progress goes back to 0. Next time, set `isHidden` back to `false` and start over. **This example is not verified in the simulator.**

Waiting 0.6 seconds lets the user see it fill up. How long the animation actually lasts is **not verified in the simulator**.

## Using images instead of colors

```js
const filled = UIImage.imageNamed('progress-filled');
const empty = UIImage.imageNamed('progress-empty');
if (filled && empty) {
  bar.progressImage = filled;
  bar.trackImage = empty;
}
```

**Effect**: The filled part uses the `filled` image, and the unfilled part uses the `empty` image. **How the images are stretched and cropped is not verified in the simulator.**

For each part, only one of color and image takes effect: writing an image makes that part's color `null`; see [Color or image, not both](../api/ui-progress-view.md#color-or-image-not-both). For where images come from, see [`UIImage`](../api/ui-image.md).

## See also

- [`UIActivityIndicatorView`](../api/ui-activity-indicator-view.md): all properties and methods of the spinner
- [`UIProgressView`](../api/ui-progress-view.md): all properties and methods of the progress bar
- [`UIStackView`](../api/ui-stack-view.md): arranging a spinner and text in a row
- [Auto Layout](../api/auto-layout.md): constraining only the position, or the left and right edges and the height
- [`fetch()`](../api/fetch.md): the request being waited for
