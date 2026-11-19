---
type: reference
native: UIApplicationUserDidTakeScreenshotNotification
---

# `Application`: `screenshot` event

The **`screenshot`** event fires after the user takes a screenshot.

## Syntax

```
application.addEventListener('screenshot', (event) => { })
```

## Event object

`Event`. `target` is `application`. Not cancelable. The event object doesn't contain the screenshot itself.

## When it fires

- After the user takes a screenshot. The screenshot has already been taken and can't be prevented.
- Firing of this event is **not verified in the simulator**.

## Examples

```js
application.addEventListener('screenshot', () => {
  console.log('User took a screenshot');
});
```

**Effect**: prints one line after the user takes a screenshot. **Not verified in the simulator.**

## Corresponding iOS API

`UIApplicationUserDidTakeScreenshotNotification`.

## See also

- [`Application`](../application.md#events)
