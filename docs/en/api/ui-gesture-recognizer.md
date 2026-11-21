---
type: reference
native: UIGestureRecognizer
status: partial
---

# `UIGestureRecognizer`

**`UIGestureRecognizer`** represents a gesture recognizer: an object attached to a view that watches the touches on that view and fires events when it recognizes a certain gesture. Ordinary views ([`UIView`](ui-view.md), text, images) fire no touch events of their own; only [controls](ui-control.md) have their own set of events. Recognizers let any view respond to gestures.

`UIGestureRecognizer` is the parent class of all recognizers. It recognizes no gesture by itself and cannot be created directly. Each recognizer recognizes one kind of gesture, and each kind of gesture is a subclass:

| Class | Gesture recognized | Fingers |
| --- | --- | --- |
| [`UITapGestureRecognizer`](ui-tap-gesture-recognizer.md) | Tap: touch down and lift quickly | 1 by default |
| [`UILongPressGestureRecognizer`](ui-long-press-gesture-recognizer.md) | Long press: hold still for a while | 1 by default |
| [`UIPanGestureRecognizer`](ui-pan-gesture-recognizer.md) | Pan: touch down and move | 1 or more by default |
| [`UIPinchGestureRecognizer`](ui-pinch-gesture-recognizer.md) | Pinch: two fingers spread apart or pinch together | 2 |
| [`UIRotationGestureRecognizer`](ui-rotation-gesture-recognizer.md) | Rotation: two fingers turn around each other | 2 |
| [`UISwipeGestureRecognizer`](ui-swipe-gesture-recognizer.md) | Swipe: a quick stroke in one direction | 1 by default |
| [`UIScreenEdgePanGestureRecognizer`](ui-screen-edge-pan-gesture-recognizer.md) | Screen-edge pan: drag inward from the edge of the screen | 1 |

Using one takes three steps: create the recognizer, listen for events on the recognizer, and attach it to a view with the view's `addGestureRecognizer()`. Listeners go on the recognizer, not on the view. A recognizer receives touches on the view it is attached to and on **all of that view's subviews**. A view manages its recognizers with three members, `addGestureRecognizer()`, `removeGestureRecognizer()`, and `gestureRecognizers`; see [`UIView`](ui-view.md).

Tap and long press have been checked with real touches in the simulator and on a device. **Pan, pinch, rotation, swipe, and screen-edge pan have not yet been checked with real touches**: creation, the default values of properties and reading and writing them, and error cases are checked in the acceptance tests, but the gestures themselves and the data carried by their events are **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → `UIGestureRecognizer`

A recognizer is not a view and has no members such as `frame` or `backgroundColor`.

For how to use recognizers to respond to taps, long presses, pans, and zooming, see the guide [Responding to gestures](../guides/gestures.md).

## Constructor

[`UIGestureRecognizer()`](ui-gesture-recognizer/constructor.md)

Cannot be called directly; always throws `TypeError`. Create recognizers with the subclasses in the table above.

## Instance properties

All subclasses have these properties.

| Property | Description |
| --- | --- |
| [`state`](ui-gesture-recognizer/state.md) <small>read-only</small> | The recognizer's current state |
| [`view`](ui-gesture-recognizer/view.md) <small>read-only</small> | The view the recognizer is attached to |
| [`isEnabled`](ui-gesture-recognizer/isenabled.md) | Whether the recognizer receives touches |
| [`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md) | Whether recognizing the gesture cancels the touches the view is handling |
| [`delaysTouchesBegan`](ui-gesture-recognizer/delaystouchesbegan.md) | Whether the view receives the start of a touch before it is certain the gesture will not be recognized |
| [`delaysTouchesEnded`](ui-gesture-recognizer/delaystouchesended.md) | Whether the view receives the end of a touch before it is certain the gesture will not be recognized |
| [`numberOfTouches`](ui-gesture-recognizer/numberoftouches.md) <small>read-only</small> | The number of fingers taking part in the gesture at this moment |
| [`recognizesSimultaneouslyWith`](ui-gesture-recognizer/recognizessimultaneouslywith.md) | The other recognizers that may recognize gestures at the same time as this one. Can be written only on recognizers you create |

## Instance methods

| Method | Description |
| --- | --- |
| [`addEventListener()`](ui-gesture-recognizer/addeventlistener.md) | Listens for a gesture event |
| [`removeEventListener()`](ui-gesture-recognizer/removeeventlistener.md) | Removes a listener |
| [`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md) | Waits until another recognizer is certain it will not recognize before recognizing |

## Events

Four of the event names are the phases a gesture goes through, and they cannot be canceled. One more, `beforebegin`, fires before the gesture begins and can be canceled. Events fire only on the recognizer itself.

| Event | Tap, swipe | Long press | Pan, pinch, rotation, screen-edge pan |
| --- | --- | --- | --- |
| [`beforebegin`](ui-gesture-recognizer/beforebegin-event.md) | When about to be recognized, asking whether to begin | When about to be recognized, asking whether to begin | When about to be recognized, asking whether to begin |
| [`began`](ui-gesture-recognizer/began-event.md) | Does not fire | When held long enough | When the gesture is recognized |
| [`changed`](ui-gesture-recognizer/changed-event.md) | Does not fire | When the finger moves after recognition | When the fingers move after recognition |
| [`ended`](ui-gesture-recognizer/ended-event.md) | When recognized | When the finger lifts | When the fingers lift |
| [`cancelled`](ui-gesture-recognizer/cancelled-event.md) | Does not fire | When interrupted | When interrupted |

When a gesture is not recognized, no event fires. For example, a long press lifted before the time is up, or a finger that moves more than 10 pt before the time is up.

The event object carries the finger position `location` and the finger count `numberOfTouches`. Pan events also carry the displacement `translation` and the velocity `velocity`; pinch events carry the factor `scale` and the velocity `velocity`; rotation events carry the angle `rotation` and the velocity `velocity`. See each event page.

`beforebegin` fires on the spot: the system waits for the listeners to finish, and if a listener calls `preventDefault()`, the gesture does not begin this time. It works only on recognizers the app creates with `new`; listening for it on one of UIKit's own recognizers (such as a scroll view's `panGestureRecognizer`) throws `TypeError`. See the [event page](ui-gesture-recognizer/beforebegin-event.md).

There are no event names such as `'tap'`, `'longpress'`, or `'swipe'`. Listening for any other name does not throw: it is treated as a custom event and fires only when you dispatch it yourself with `dispatchEvent()`.

## Discrete and continuous gestures

Gestures fall into two kinds, which fire different events.

| | Discrete gestures | Continuous gestures |
| --- | --- | --- |
| Examples | Tap, swipe | Long press, pan, pinch, rotation, screen-edge pan |
| Characteristics | Over as soon as recognized; notified only once | Last for a while after recognition, with notifications throughout |
| Events fired | Only `ended` | `began`, then zero or more `changed`, and finally `ended` or `cancelled` |

## Callbacks cannot read the state as it was

Callbacks do not run at the moment the gesture happens; they run a little later. For background, see [How the runtime works](how-it-works.md). Reading [`state`](ui-gesture-recognizer/state.md) in a callback gives the state at the moment the callback runs. Measured:

| Read in which callback | `state` read | Why |
| --- | --- | --- |
| A tap's `ended` | `'possible'` | The recognizer returns to its initial state right after the gesture ends |
| A long press's `began`, with the finger still down | `'began'` | The gesture is still in progress. If the finger has already moved, it may read `'changed'` |

So:

- To know the phase, look at the event name; do not read `state`.
- Read the finger position and count from the event object's `location` and `numberOfTouches`.
- Read a pan's displacement and velocity, a pinch's factor, and a rotation's angle from the event object too. The recognizer also has members that read these values (`translationInView()`, `scale`, `rotation`, and so on); calling them in a callback gives the value at the moment the callback runs. While the gesture is in progress, that value may be newer than the one on the event object; whether the system resets these values to zero after the gesture ends is **not verified in the simulator**.

## Recognizers and the view's own touches

The recognizer and the view receive touches at the same time. Once the recognizer recognizes the gesture, the system cancels the touch the view is handling. For a [control](ui-control.md), this shows up as receiving `touchcancel` instead of `touchupinside`. **Not verified in the simulator.**

Set [`cancelsTouchesInView`](ui-gesture-recognizer/cancelstouchesinview.md) to `false` and the view receives the whole touch as usual, so both the recognizer and the control events fire. **Not verified in the simulator.**

One case the system already handles: a parent view has a single-finger, single-tap recognizer, and a subview contains a [`UIButton`](ui-button.md). Tapping the button then fires only the button's own events, and the parent view's recognizer does not fire (measured).

## Ownership

A view keeps the recognizers attached to it. Once a recognizer is attached to a view, the app's code does not need to hold on to it separately. As long as the view exists, the recognizer and its listeners stay in effect.

A recognizer can be on only one view at a time. Attaching it to another view automatically removes it from the original view.

The relationship set up by [`requireGestureRecognizerToFail()`](ui-gesture-recognizer/requiregesturerecognizertofail.md) does not keep the recognizers alive. Each of the two recognizers is still kept by the view it is attached to. If one of them is not attached to a view and the app's code does not hold on to it either, it is garbage-collected and the relationship stops working.

The list in [`recognizesSimultaneouslyWith`](ui-gesture-recognizer/recognizessimultaneouslywith.md) likewise does not keep the recognizers in it alive. Once a recognizer in the list is garbage-collected, it disappears from the list.

## Examples

Starting from a blank app, place a rectangle on the screen. Tapping it changes its color; holding it prints a line of text.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const card = new UIView();
  card.frame = new CGRect(40, 120, 200, 120);
  card.backgroundColor = 'systemIndigo';
  card.layer.cornerRadius = 16;
  page.view.addSubview(card);

  const tap = new UITapGestureRecognizer();
  let on = false;
  tap.addEventListener('ended', () => {
    on = !on;
    card.backgroundColor = on ? 'systemOrange' : 'systemIndigo';
  });
  card.addGestureRecognizer(tap);

  const press = new UILongPressGestureRecognizer();
  press.addEventListener('began', () => {
    console.log('Held down');
  });
  card.addGestureRecognizer(press);
});
```

**Effect**

- A 200 × 120 pt indigo rounded rectangle appears near the top left of the screen.
- Tap the rectangle once and it turns orange. Tap again and it turns back to indigo.
- Hold the rectangle for 0.5 seconds and the console prints `Held down`. The color does not change on release (**that the tap does not fire when a long press is released is not verified in the simulator**).

This code has not been run as a whole in the simulator. Creation, the default property values, and attaching to a view are checked in the acceptance tests; a tap firing `ended`, holding firing `began`, and releasing firing `ended` are also checked in the acceptance tests with real touches.

For more patterns, see the guide [Responding to gestures](../guides/gestures.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UITapGestureRecognizer alloc] initWithTarget:self action:@selector(onTap:)]` | `new UITapGestureRecognizer()`, then `addEventListener('ended', onTap)` |
| `[recognizer addTarget:self action:@selector(onPress:)]` | `recognizer.addEventListener('began', onPress)`, one event name per phase |
| `[recognizer removeTarget:self action:@selector(onPress:)]` | `recognizer.removeEventListener('began', onPress)` |
| Checking `recognizer.state == UIGestureRecognizerStateBegan` in the action | Listening for `'began'` |
| `UIGestureRecognizerStateRecognized` | `'ended'` |
| `[recognizer locationInView:recognizer.view]` | The event object's `location` |
| `[view addGestureRecognizer:recognizer]` | `view.addGestureRecognizer(recognizer)` |
| `[view removeGestureRecognizer:recognizer]` | `view.removeGestureRecognizer(recognizer)` |
| `recognizer.enabled = NO` | `recognizer.isEnabled = false` |
| `[single requireGestureRecognizerToFail:dbl]` | `single.requireGestureRecognizerToFail(dbl)` |
| The delegate's `gestureRecognizerShouldBegin:` returning `NO` | Listening for `'beforebegin'` and calling `event.preventDefault()` |
| The delegate's `gestureRecognizer:shouldRecognizeSimultaneouslyWithGestureRecognizer:` returning `YES` | Putting the other recognizer in `recognizesSimultaneouslyWith` |
| `recognizer.delegate = self` | Not needed. The two items above are written directly on the recognizer |

In ObjC, one action method receives every phase of the gesture and tells them apart with `state`. In JS, each phase is an event name. For the properties of each subclass, see its class page.

## See also

- [Responding to gestures](../guides/gestures.md): how to write each gesture, which one wins when a button is also present, attaching several recognizers to one view, and making two gestures work together
- [`UIView`](ui-view.md): recognizers are attached to views; `hitTest()`, `convertPoint()`, `isUserInteractionEnabled`
- [`UIControl`](ui-control.md): controls such as buttons have their own set of events and do not need recognizers
- [Structs](structs.md): `CGPoint` (position, displacement, velocity) and `CGAffineTransform` (applying scale and rotation to a view)
- [Native classes](native-classes.md): why these classes cannot be subclassed
