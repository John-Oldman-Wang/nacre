# Responding to gestures

This guide covers how to use gesture recognizers to make ordinary views respond to taps, long presses, drags, pinches, rotations, and swipes, and which one takes effect when a recognizer is combined with a button, with another recognizer, or with a scroll view. The recognizer classes are [`UIGestureRecognizer`](../api/ui-gesture-recognizer.md) and its seven subclasses; the details of each property, method, and event are on their own reference pages.

## Recommended approach

- **For button-style interaction, use [`UIButton`](../api/ui-button.md), not a recognizer.** A button comes with its own pressed appearance and disabled state. A recognizer only tells the app "a gesture was recognized"; you have to provide visual feedback on press yourself.
- **Use a recognizer when a view that isn't a control needs to respond to taps.** For example, a card, a line of text, or an image.
- **When a container has many tappable subviews, add one recognizer to the container**, and use `hitTest()` in the callback to find which subview was tapped; see [Handling taps in one place on the parent view](#handling-taps-in-one-place-on-the-parent-view). You don't need to add and remove recognizers as subviews come and go.
- **Tell the gesture's phase from the event name, and read positions from the event object.** Don't read the recognizer's `state` in the callback.
- **When dragging a view, record its starting position in `began`, and in `changed` compute the new position as "starting position + the event's `translation`".** `translation` is the displacement accumulated since the gesture began, so written this way you don't need to reset it in every callback; see [Dragging a view](#dragging-a-view).
- **When you need an inertia animation after release, read the velocity from the `velocity` of the `ended` event.** By the time the callback runs the gesture has ended, and calling `velocityInView()` then doesn't give the velocity at the moment of release.
- **When swipes need to distinguish directions, create one recognizer per direction.** One recognizer can recognize several directions, but the event doesn't say which one was recognized.


## First example
The code below starts from a blank app and puts a rectangle on screen. Tapping it changes its color; pressing and holding it prints a line of text.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. An ordinary view. It isn't a control and doesn't respond to taps by itself
  const card = new UIView();
  card.frame = new CGRect(40, 120, 200, 120);
  card.backgroundColor = 'systemIndigo';
  card.layer.cornerRadius = 16;
  page.view.addSubview(card);

  // 2. Create a tap recognizer, listen for ended, and add it to the view
  const tap = new UITapGestureRecognizer();
  let on = false;
  tap.addEventListener('ended', () => {
    on = !on;
    card.backgroundColor = on ? 'systemOrange' : 'systemIndigo';
  });
  card.addGestureRecognizer(tap);

  // 3. Add a long-press recognizer too. It fires began after being held for 0.5 seconds
  const press = new UILongPressGestureRecognizer();
  press.addEventListener('began', () => {
    console.log('pressed and held');
  });
  card.addGestureRecognizer(press);
});
```

**Effect**:

- A 200 × 120 pt indigo rounded rectangle appears near the top left of the screen.
- Tap the rectangle and it turns orange. Tap again and it turns back to indigo.
- Press and hold the rectangle for 0.5 seconds and the console prints `pressed and held`. The color doesn't change after release (**that the tap doesn't fire when a long press is released is not verified in the simulator**).

This code has not been run as a whole in the simulator. Creation, the default property values, and adding to the view were checked in the acceptance tests; that a tap fires `ended`, holding fires `began`, and releasing fires `ended` were also checked in the acceptance tests with real touches.

The three steps are: create the recognizer, listen for events on the recognizer, and add the recognizer to the view. The order of the last two steps doesn't matter.

The first few lines of the full example are needed in every app: create the window and view controller in the `sceneconnect` callback; see [`UIWindowScene`](../api/ui-window-scene.md).


The sections below reuse `page`, `card`, `tap`, and `press` from above. To try a section on its own, start with these lines:

```js
const page = new UIViewController();
const card = new UIView();
page.view.addSubview(card);
const tap = new UITapGestureRecognizer();
card.addGestureRecognizer(tap);
const press = new UILongPressGestureRecognizer();
card.addGestureRecognizer(press);
```

## Getting the tap location

`location` on the event object is the finger's position, in the coordinate system of the recognizer's view, in [pt](../api/units.md).

```js
tap.addEventListener('ended', (e) => {
  const { location } = e;
  if (location !== null) {
    console.log(location.x, location.y);
  }
});
```

**Effect**: Tapping near the top-left corner of the rectangle prints two numbers close to 0. Tapping near the bottom-right corner prints two numbers close to `200 120`.

Checked in the acceptance tests: tapping 28 pt from the left and 28 pt from the top inside the view gives a `location` of `(28, 28)`.

The event object is a [`UIGestureRecognizerEvent`](../api/ui-gesture-recognizer-event.md); read `location` directly.

## Responding to a double tap

```js
const doubleTap = new UITapGestureRecognizer();
doubleTap.numberOfTapsRequired = 2;
doubleTap.addEventListener('ended', () => {
  console.log('double tap');
});
card.addGestureRecognizer(doubleTap);
```

**Effect**: Tapping the rectangle twice quickly prints `double tap`. **Not verified in the simulator.**

> **Note:** When the same view has both a single-tap recognizer and a double-tap recognizer, the first tap of a double tap triggers the single tap first. **Not verified in the simulator.** For the fix, see the next section.

## Making the single tap wait for the double tap to fail

`a.requireGestureRecognizerToFail(b)` makes recognizer `a` wait until recognizer `b` is sure it can't recognize before recognizing. If `b` recognizes its gesture, `a` doesn't.

```js
const doubleTap = new UITapGestureRecognizer();
doubleTap.numberOfTapsRequired = 2;
card.addGestureRecognizer(doubleTap);

const singleTap = new UITapGestureRecognizer();
singleTap.addEventListener('ended', () => {
  console.log('single tap');
});
singleTap.requireGestureRecognizerToFail(doubleTap);
card.addGestureRecognizer(singleTap);
```

**Effect**: Tapping the rectangle twice quickly prints only `double tap`. Tapping it once prints `single tap`; this line appears later than it would without this relationship, because the system first waits a short while to be sure there's no second tap. **Not verified in the simulator.**

The first three lines create the double-tap recognizer `doubleTap` from the previous section. `tap` in the full example is also a single-tap recognizer; a separate one is created here so as not to change its behavior.

Once established, this relationship can't be undone. The two recognizers don't keep each other alive; both must be added to views to take effect; see [Ownership](../api/ui-gesture-recognizer.md#ownership).

## Changing how long a long press takes

```js
press.minimumPressDuration = 1;
```

**Effect**: You must hold for 1 second before `began` fires. The unit is seconds, not milliseconds. **Not verified in the simulator.**

## Dimming while the finger is down

A tap recognizer fires its event only after the finger lifts, so it can't do "dim on press, restore on release". Use a long-press recognizer with [`minimumPressDuration`](../api/ui-long-press-gesture-recognizer/minimumpressduration.md) set to `0`: it begins as soon as the finger presses down. Reusing `card`:

```js
const touch = new UILongPressGestureRecognizer();
touch.minimumPressDuration = 0;
touch.addEventListener('began', () => {
  card.alpha = 0.6;
});
touch.addEventListener('ended', () => {
  card.alpha = 1;
  console.log('tapped the card');
});
touch.addEventListener('cancelled', () => {
  card.alpha = 1;
});
card.addGestureRecognizer(touch);
```

**Effect**: When the finger presses on the card, the card fades immediately; on release it is restored and the console prints `tapped the card`; when the system interrupts the touch (for example, an incoming call), it is also restored. **Not verified in the simulator.**

> **Note:** With this setting, the recognizer commits to the gesture the moment the finger presses down. When the card is inside a scrollable list, it may win before scrolling does, keeping the list from scrolling; it may also conflict with other recognizers on the same view. **Not verified in the simulator.** When a [`UIButton`](../api/ui-button.md) can achieve this kind of effect, prefer the button.

## Following the finger after a long press

After a long press is recognized, each finger movement fires `changed`, and lifting fires `ended`.

```js
press.addEventListener('changed', (e) => {
  const { location } = e;
  if (location !== null) {
    console.log('moved to', location.x, location.y);
  }
});
press.addEventListener('ended', () => {
  console.log('released');
});
```

**Effect**: After holding the rectangle for 0.5 seconds, keep holding and move the finger; each movement prints a line `moved to` with the current position. When the finger lifts, it prints `released`.

Checked in the acceptance tests: after holding, moving the finger in four steps gives 4 `changed` events; the `location` of `ended` is the position where the finger lifted. Holding still gives no `changed` at all.

Before the long press is recognized, if the finger moves more than `allowableMovement` (10 pt by default), it doesn't count as a long press and no events fire. After it is recognized, the finger can move any distance.

## Dragging a view

A pan recognizer's events carry `translation`: how far the finger has moved from the start of the gesture up to this event. Record the view's starting position in `began`, and add the displacement in `changed`.

```js
const drag = new UIPanGestureRecognizer();
let start = card.center;
drag.addEventListener('began', () => {
  start = card.center;
});
drag.addEventListener('changed', (e) => {
  const { translation } = e;
  card.center = new CGPoint(start.x + translation.x, start.y + translation.y);
});
card.addGestureRecognizer(drag);
```

**Effect**: Press on the rectangle and move the finger, and the rectangle follows the finger. After release, the rectangle stays where it was released. Dragging again continues from the new position.

`translation` is in the coordinate system of the recognizer's view (here `card`), in [pt](../api/units.md). When `card` has no `transform`, this is the same as the displacement in the parent view's coordinate system and can be added directly to `center`. When `card` has a scaling or rotating `transform`, the two differ; in that case call `drag.translationInView(page.view)` in the callback to get the displacement in the parent view's coordinate system.

## Reading the velocity on release

The `velocity` of the `ended` event is the finger's velocity at the moment of release, in pt per second, with a horizontal and a vertical component.

`drag` is the pan recognizer added to `card` in the previous section:

```js
const drag = new UIPanGestureRecognizer();
card.addGestureRecognizer(drag);

drag.addEventListener('ended', (e) => {
  const { velocity } = e;
  if (velocity.x > 500) {
    console.log('flung to the right');
  }
});
```

**Effect**: Dragging quickly to the right and releasing prints `flung to the right`. Dragging slowly and releasing, or stopping before releasing, prints nothing.

## Recognizing only two-finger drags

```js
const twoFingerDrag = new UIPanGestureRecognizer();
twoFingerDrag.minimumNumberOfTouches = 2;
twoFingerDrag.maximumNumberOfTouches = 2;
card.addGestureRecognizer(twoFingerDrag);
```

**Effect**: When one finger drags the rectangle, this recognizer fires no events. It fires only when two fingers drag together.

## Pinching to zoom

A pinch recognizer's events carry `scale`: the distance between the two fingers as a multiple of the distance at the start of the gesture. Every gesture starts from 1, so record the multiple at the end of the previous gesture and multiply.

```js
const pinch = new UIPinchGestureRecognizer();
let baseScale = 1;
pinch.addEventListener('changed', (e) => {
  const { scale } = e;
  card.transform = CGAffineTransform.scale(baseScale * scale);
});
pinch.addEventListener('ended', (e) => {
  const { scale } = e;
  baseScale = baseScale * scale;
});
card.addGestureRecognizer(pinch);
```

**Effect**: Put two fingers on the rectangle and spread them, and the rectangle grows; pinch them together and it shrinks. After release it keeps its size. Pinching again continues from the current size.

For `CGAffineTransform`, see [structs](../api/cg-affine-transform.md).

## Rotating with two fingers

A rotation recognizer's events carry `rotation`: the angle turned since the start of the gesture, in radians. Every gesture starts from 0.

```js
const twist = new UIRotationGestureRecognizer();
let baseAngle = 0;
twist.addEventListener('changed', (e) => {
  const { rotation } = e;
  card.transform = CGAffineTransform.rotation(baseAngle + rotation);
});
twist.addEventListener('ended', (e) => {
  const { rotation } = e;
  baseAngle = baseAngle + rotation;
});
card.addGestureRecognizer(twist);
```

**Effect**: Put two fingers on the rectangle and turn them, and the rectangle turns with them. After release it keeps its angle. Whether the rectangle turns in the same direction as the fingers is **not verified in the simulator**.

> **Note:** When this section's recognizer and the previous section's are added to the same view, only the one that recognizes first fires events in a single touch; you can't zoom and rotate at the same time. When using this section's code on its own, remove the previous section's `pinch` from `card`.

## Responding to swipes

A swipe recognizer recognizes rightward swipes by default. Specify the direction with `direction`.

```js
const swipeLeft = new UISwipeGestureRecognizer();
swipeLeft.direction = ['left'];
swipeLeft.addEventListener('ended', () => {
  console.log('swiped left');
});
card.addGestureRecognizer(swipeLeft);

const swipeRight = new UISwipeGestureRecognizer();
swipeRight.direction = ['right'];
swipeRight.addEventListener('ended', () => {
  console.log('swiped right');
});
card.addGestureRecognizer(swipeRight);
```

**Effect**: A quick swipe left across the rectangle prints `swiped left`; a quick swipe right prints `swiped right`. Moving slowly isn't a swipe and prints nothing.

`direction` can list several directions, such as `['left', 'right']`. Then both directions trigger the same `ended`, and the event doesn't say which direction it was. To distinguish directions, create one recognizer per direction as above.

## Dragging in from the screen edge

A screen-edge pan recognizer recognizes only drags that start at the edge of the screen. `edges` specifies which edges; the default is an empty array, so without setting it no gesture is recognized.

```js
const fromRight = new UIScreenEdgePanGestureRecognizer();
fromRight.edges = ['right'];
fromRight.addEventListener('began', () => {
  console.log('dragged in from the right edge');
});
page.view.addGestureRecognizer(fromRight);
```

**Effect**: Dragging left from the right edge of the screen prints `dragged in from the right edge`. Dragging from the middle of the screen prints nothing.

The recognizer is added to `page.view` because it fills the whole screen, including the screen edges. Its events are the same as a pan recognizer's and also carry `translation` and `velocity`.

When the view controller is in a [navigation controller](../api/ui-navigation-controller.md), the left edge of the screen is already taken by "swipe right to go back to the previous view controller".

## Making text or images tappable

[`UILabel`](../api/ui-label.md) and [`UIImageView`](../api/ui-image.md) don't receive touches by default, so recognizers added to them receive nothing. Turn on `isUserInteractionEnabled` first.

```js
const link = new UILabel();
link.text = 'View details';
link.frame = new CGRect(40, 260, 200, 24);
link.isUserInteractionEnabled = true;
page.view.addSubview(link);

const linkTap = new UITapGestureRecognizer();
linkTap.addEventListener('ended', () => {
  console.log('tapped the text');
});
link.addGestureRecognizer(linkTap);
```

**Effect**: A line of text, "View details", appears below the rectangle. Tapping it prints `tapped the text`. **Not verified in the simulator.**

## Handling taps in one place on the parent view

A recognizer receives touches on all subviews of its view. So add a single recognizer to the parent view and use `hitTest()` to find which subview was tapped. For `hitTest()`, see [`UIView`](../api/ui-view.md).

```js
const badge = new UIView();
badge.frame = new CGRect(16, 16, 40, 40);
badge.backgroundColor = 'systemOrange';
card.addSubview(badge);

const cardTap = new UITapGestureRecognizer();
cardTap.addEventListener('ended', (e) => {
  const { location } = e;
  if (location === null) return;
  const hit = card.hitTest(location);
  console.log(hit === badge ? 'tapped the square' : 'tapped elsewhere on the rectangle');
});
card.addGestureRecognizer(cardTap);
```

**Effect**: Tapping the orange square prints `tapped the square`. Tapping anywhere else in the rectangle prints `tapped elsewhere on the rectangle`.

This pattern was checked in the acceptance tests with real touches: tapping the subview makes `hitTest()` return the subview, and tapping empty space returns the parent view itself.

`location` is in `card`'s coordinate system, and `card.hitTest()` also wants a point in `card`'s coordinate system, so it can be passed directly.

## Temporarily disabling

```js
tap.isEnabled = false;
```

**Effect**: Tapping the rectangle no longer does anything. Setting it back to `true` restores it. **Not verified in the simulator.**

## Removing listeners and recognizers

```js
/** @param {Event} e */
function onTap(e) {
  console.log('tapped');
}
tap.addEventListener('ended', onTap);

tap.removeEventListener('ended', onTap);   // Removes only this one listener
card.removeGestureRecognizer(tap);         // Takes the recognizer off the view
console.log(tap.view);
```

**Effect**: The console prints `null`. The recognizer is no longer on any view, and tapping the rectangle no longer triggers it. The recognizer object can still be used and can be added to another view.

## Which views' touches a recognizer receives

A recognizer receives touches on its own view and on **all subviews** of that view. Add a recognizer to a parent view, and tapping a subview also triggers it. Events are fired only on the recognizer and aren't passed to other objects.

The view must receive touches for the recognizer to get them. [`UILabel`](../api/ui-label.md) and [`UIImageView`](../api/ui-image.md) don't receive touches by default; set `isUserInteractionEnabled` to `true` first; see [Making text or images tappable](#making-text-or-images-tappable).

## Which takes effect when gestures and buttons coexist

| Situation | Result | Basis |
| --- | --- | --- |
| The parent view has a single-finger single-tap recognizer, a subview contains a [`UIButton`](../api/ui-button.md), and the user taps the button | Only the button's events fire; the parent view's recognizer doesn't trigger | Measured |
| Same as above, but the subview is a directly created [`UIControl`](../api/ui-control.md) | Not checked | **Not verified in the simulator** |
| The parent view has a long-press recognizer, and the user long-presses a control in a subview | After the recognizer recognizes the long press, the system cancels the touch the control was handling. The control fires `touchcancel`, not `touchupinside` | **Not verified in the simulator** |

To have both the recognizer's and the control's events fire, set the recognizer's `cancelsTouchesInView` to `false`; see [Recognizers and the view's own touches](../api/ui-gesture-recognizer.md#recognizers-and-the-views-own-touches).

## Adding several recognizers to one view

A view can have several recognizers. A tap and a long press on the same view is a common combination: a tap triggers the tap, holding triggers the long press (measured; see [First example](#first-example)). That the tap recognizer doesn't trigger when a long press is released is **not verified in the simulator**.

When the same view has both a single-tap recognizer and a double-tap recognizer, the first tap of a double tap triggers the single tap first. **Not verified in the simulator.** To make the single tap trigger only after the system is sure it isn't a double tap, use `requireGestureRecognizerToFail()`; see [Making the single tap wait for the double tap to fail](#making-the-single-tap-wait-for-the-double-tap-to-fail).

By default, two recognizers on the same view don't recognize gestures at the same time: in a single touch, the one that recognizes first takes effect. So with a pinch and a rotation on the same view, only one of them fires events at a time. This is based on Apple's documentation and is **not verified in the simulator**. To have them recognize together, see [Making two gestures work together](#making-two-gestures-work-together).

A recognizer can be on only one view at a time. When you add it to another view, it is automatically removed from the original view.

## Gestures in scroll views

The view a recognizer is on can be inside a [scroll view](../api/ui-scroll-view.md). The gestures section of the acceptance interface is inside a scroll view, and taps there were checked with real touches.

How a long-press recognizer behaves inside a scroll view is **not verified in the simulator**.

A scroll view itself scrolls using a pan recognizer. If you add another pan recognizer to a view inside the scroll view, whether dragging that view triggers it or scrolls the scroll view is **not verified in the simulator**. To have both take effect, see the next section.

## Making two gestures work together

By default, in a single touch the recognizer that recognizes first takes effect, and the other recognizers stop recognizing. To have two recognizers recognize together, put one of them in the other's [`recognizesSimultaneouslyWith`](../api/ui-gesture-recognizer/recognizessimultaneouslywith.md).

With a pinch and a rotation on the same view recognizing together, the user can scale and rotate at the same time:

```js
const pinch = new UIPinchGestureRecognizer();
const rotate = new UIRotationGestureRecognizer();
pinch.recognizesSimultaneouslyWith = [rotate];
card.addGestureRecognizer(pinch);
card.addGestureRecognizer(rotate);
```

**Effect**: when two fingers on `card` spread and turn at the same time, both `pinch` and `rotate` fire events. **Not verified with a real finger.**

Writing it on one side is enough: if either of the two recognizers lists the other, the two can recognize together (from the iOS definition).

When a view inside a scroll view should follow a dragging finger while the scroll view still scrolls as usual, list the scroll view's built-in pan recognizer, [`panGestureRecognizer`](../api/ui-scroll-view/pangesturerecognizer.md). This property cannot be written on UIKit's own recognizers, so write it on the one you created:

```js
const scroller = new UIScrollView();
page.view.addSubview(scroller);
scroller.addSubview(card);

const pan = new UIPanGestureRecognizer();
const scrollPan = scroller.panGestureRecognizer;
if (scrollPan !== null) {
  pan.recognizesSimultaneouslyWith = [scrollPan];
}
card.addGestureRecognizer(pan);
```

**Effect**: dragging on `card` scrolls the scroll view as usual, and `pan` also fires `began`, `changed`, and `ended`. **Not verified with a real finger.** The answer the system gets after the write, when it asks whether the two may recognize together, is verified in the acceptance suite.

## Beginning a gesture only in certain places

To keep a recognizer from beginning in some situations, listen for its [`beforebegin`](../api/ui-gesture-recognizer/beforebegin-event.md) and call `preventDefault()` in the listener. The system fires this event on the spot when the recognizer is about to recognize the gesture, and decides whether to begin after the listeners finish.

```js
const handlePan = new UIPanGestureRecognizer();
handlePan.addEventListener('beforebegin', (event) => {
  const { location } = event;
  if (location === null || location.x > 40) event.preventDefault();
});
card.addGestureRecognizer(handlePan);
```

**Effect**: the drag begins only when the finger is within the left 40 pt of `card`; dragging elsewhere makes `handlePan` fire no events. **Not verified with a real finger.** That the recognizer does not begin after `preventDefault()` is called is verified in the acceptance suite.

- The system waits while the listener runs, so only make the decision there.
- Like `recognizesSimultaneouslyWith`, `beforebegin` works only on recognizers you create. Listening for it on one of UIKit's own recognizers, such as a scroll view's `panGestureRecognizer`, throws `TypeError`.

## See also

- [`UIGestureRecognizer`](../api/ui-gesture-recognizer.md): events, shared properties, discrete and continuous gestures
- [`UITapGestureRecognizer`](../api/ui-tap-gesture-recognizer.md), [`UILongPressGestureRecognizer`](../api/ui-long-press-gesture-recognizer.md), [`UIPanGestureRecognizer`](../api/ui-pan-gesture-recognizer.md), [`UIPinchGestureRecognizer`](../api/ui-pinch-gesture-recognizer.md), [`UIRotationGestureRecognizer`](../api/ui-rotation-gesture-recognizer.md), [`UISwipeGestureRecognizer`](../api/ui-swipe-gesture-recognizer.md), [`UIScreenEdgePanGestureRecognizer`](../api/ui-screen-edge-pan-gesture-recognizer.md): the seven kinds of recognizers
- [`UIView`](../api/ui-view.md): `addGestureRecognizer()`, `hitTest()`, `isUserInteractionEnabled`
- [Handling touches on controls](control-touches.md): the events of controls such as buttons
- [Structs](../api/structs.md): `CGPoint` and `CGAffineTransform`
