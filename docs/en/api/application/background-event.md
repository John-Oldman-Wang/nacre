---
type: reference
native: UIApplicationDidEnterBackgroundNotification
---

# `Application`: `background` event

The **`background`** event fires when the app has entered the background.

## Syntax

```
application.addEventListener('background', (event) => { })
```

## Event object

`Event`. `target` is `application`. Not cancelable.

## When it fires

- When the user goes to the Home Screen or switches to another app, after [`inactive`](inactive-event.md). It fires only when the app actually enters the background; temporary interruptions such as incoming calls don't fire it.
- When the event arrives, [`state`](state.md) is `'background'` (verified by testing).
- The callback runs later; see [How the runtime works](../how-it-works.md#events).

After the app enters the background, the system suspends it after a short while: JS stops running and timers stop firing. When the user returns to the app, it resumes where it left off, and the variables in JS are still there. The system may also terminate the app outright while it's in the background; there's no notification in that case, and `main.js` runs from the start the next time the app opens. **These points come from iOS's definitions and are not verified in the simulator.** What happens to network requests still in flight when the app enters the background is **not verified in the simulator**.

Finish saving any data you need to keep in this event, writing it to [`application.storage`](storage.md). Don't wait for [`beforeterminate`](beforeterminate-event.md).

## Examples

```js
application.addEventListener('background', () => {
  application.storage.set('lastSeen', Date.now());
});
```

**Effect**: each time the app enters the background, the current time is saved to local storage. It can be read the next time the app opens.

## Corresponding iOS API

`UIApplicationDidEnterBackgroundNotification`.

## See also

- [Handling the app lifecycle](../../guides/app-lifecycle.md#save-data-when-entering-the-background)
