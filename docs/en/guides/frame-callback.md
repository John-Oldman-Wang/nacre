# Running code every frame

This guide shows how to use [`CADisplayLink`](../api/ca-display-link.md) to run code once every time the screen refreshes a frame, updating the UI frame by frame from code: starting, stopping, computing positions from elapsed time, and controlling the frame rate.

## Recommended approach

- **Consider animation objects first.** Animations that can be expressed as "from one value to another" or "through several values in turn" should use the animation objects described in [Animating layers](animation.md). Once an animation object is added to a layer, the system computes the in-between value for each frame without running JS (**this comes from the iOS definition and is not verified in the simulator**). `CADisplayLink` runs a JS callback every frame, and when JS is busy running other code, the callback has to wait until it finishes: the acceptance tests once measured the first frame arriving 2.07 seconds after `addToRunLoop()`, because JS was running other code the whole time.
- **`CADisplayLink` is for cases animation objects can't express**: positions that depend on live data, your own physics simulation, or game logic that needs a decision every frame.
- **Use `'common'` for `forMode`.** The callback then keeps running while the user drags a scroll view.
- **Advance by elapsed time, not by the number of callbacks.** See [Computing positions from time, not frame counts](#computing-positions-from-time-not-frame-counts).
- **Always call `invalidate()` when you're done with it.** Once it's added to the event loop, it keeps working even if your code doesn't keep a reference to it.
- **Don't animate with timers.** Timer callbacks aren't synchronized with screen refreshes; see [Timers](../api/timers.md).

## First example

Starting from a blank app, move a dot back and forth across the screen.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. A dot
  const dot = new UIView();
  dot.frame = new CGRect(20, 200, 20, 20);
  dot.backgroundColor = 'systemBlue';
  dot.layer.cornerRadius = 10;
  page.view.addSubview(dot);

  // 2. Compute the position from elapsed time on every frame
  const link = new CADisplayLink();
  let start = 0;
  link.addEventListener('tick', (ev) => {
    const frame = ev.frame;
    if (start === 0) start = frame.timestamp;

    const t = (frame.timestamp - start) % 2;          // seconds; one round trip every 2 seconds
    const x = t < 1 ? t * 240 : (2 - t) * 240;
    dot.frame = new CGRect(20 + x, 200, 20, 20);
  });

  // 3. Add it to the main thread's event loop to start it
  link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
});
```

**Effect**: The dot moves back and forth across the screen: 1 second from left to right, 1 second back.

This code hasn't been run in the simulator as a whole.

**Both steps are required**: listen for [`tick`](../api/ca-display-link/tick-event.md) and call [`addToRunLoop()`](../api/ca-display-link/addtorunloop.md). If you do only one of them, the callback never runs.

## Starting and stopping

```js
const link = new CADisplayLink();

link.addEventListener('tick', (ev) => {
  const frame = ev.frame;
  console.log('Frame time:', frame.timestamp);
});

link.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Result**: Every time the screen refreshes a frame, the console prints a line.

[`NSRunLoop.mainRunLoop`](../api/ns-run-loop/mainrunloop.md) is the event loop of the app's main thread. A `CADisplayLink` starts working only after it's added to it.

**Once added, a `CADisplayLink` keeps working until it's stopped.** Even if your code doesn't keep a reference to it, it doesn't stop, and the callback keeps running every frame. So always stop it when you're done:

```js
link.isPaused = true;    // Pause. Set it back to false to resume
link.invalidate();       // Stop for good. It can't be restarted; create a new one if needed
```

**Effect**: After pausing or stopping, `tick` no longer fires.

The callback doesn't run synchronously at the moment the screen refreshes; see [How the runtime works](../api/how-it-works.md). So after pausing or stopping, a callback that was already dispatched but hasn't run yet still runs. If your callback depends on "already stopped", check for it yourself.

## Continuing while scrolling

The `forMode` of `addToRunLoop()` determines whether callbacks continue while the user drags a scroll view:

| `forMode` | Effect |
| --- | --- |
| `'common'` | Always called back. **Usually use this** |
| `'default'` | Called back normally, paused while the user drags a scroll view. This is the default when `forMode` is omitted |
| `'tracking'` | Called back only while the user drags a scroll view |

The differences between the three values during scrolling come from the iOS definition and are **not verified in the simulator**. The acceptance tests use only `'common'`.

## Computing positions from time, not frame counts

The `frame` of the `tick` event object contains three times, all in **seconds**:

| Field | Meaning |
| --- | --- |
| `timestamp` | The time of this frame |
| `duration` | The interval between two frames |
| `targetTimestamp` | The time this frame's content will be shown on screen; later than `timestamp` |

These three times are only meaningful relative to each other. Their origin differs from that of `Date.now()`, so don't mix them in calculations.

```js
const mover = new CADisplayLink();
const speed = 120;       // pt per second
let last = 0;
let x = 0;

mover.addEventListener('tick', (ev) => {
  const frame = ev.frame;
  const dt = last === 0 ? 0 : frame.timestamp - last;   // seconds since the previous callback
  last = frame.timestamp;
  x += speed * dt;
  console.log(x);
});
mover.addToRunLoop(NSRunLoop.mainRunLoop, { forMode: 'common' });
```

**Result**: `x` increases by 120 per second, regardless of how many frames per second the screen refreshes.

**Advance each callback by the elapsed time; don't write it as "move a fixed distance per callback".** Different devices have different frame rates, and callbacks can also arrive late; with a fixed distance, the object's speed changes with the frame rate.

These three values are carried on the event object. Properties such as `mover.timestamp` can also be read, but by the time the callback runs they may already hold the next frame's values, so use the ones on the event object in the callback.

## Lowering the frame rate

When you don't need to update every frame, use [`preferredFrameRateRange`](../api/ca-display-link/preferredframeraterange.md) to tell the system how many callbacks per second you'd like:

```js
mover.preferredFrameRateRange = new CAFrameRateRange(30, 60, 30);
console.log(String(mover.preferredFrameRateRange));
```

**Result**: The console prints `CAFrameRateRange(30, 60, 30)`. The three numbers are the minimum, maximum, and preferred frame rates, in frames per second. How many callbacks per second actually happen after it's set is **not verified in the simulator**.

## See also

- [`CADisplayLink`](../api/ca-display-link.md): all members
- [`NSRunLoop`](../api/ns-run-loop.md): the first argument of `addToRunLoop()`
- [Animating layers](animation.md): animations that animation objects can express
- [Timers](../api/timers.md): why not to animate with timers
