---
type: reference
native: UIActivityViewControllerCompletionEvent.activityError
---

# `UIActivityViewControllerCompletionEvent`: `activityError` property

The **`activityError`** property is the error the system gave when the action failed.

## Value

An [`NSError`](../ns-error.md) or `null`. `message` is the system's description, and `domain` and `code` are the system's error domain and code. It is `null` when nothing went wrong.

- Read-only. Assigning to it throws `TypeError`.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const sheet = new UIActivityViewController(['你好']);
sheet.addEventListener('complete', (e) => {
  if (e.activityError !== null) {
    console.log('分享出错了', e.activityError.domain, e.activityError.code);
  }
});
```

**Effect**: when the chosen action fails, prints the error domain and code. **Not verified in the simulator.**

## Corresponding iOS API

The `activityError` parameter of `completionWithItemsHandler`.

## See also

- [`UIActivityViewControllerCompletionEvent`](../ui-activity-view-controller-completion-event.md)
