---
type: reference
native: UIActivityViewControllerCompletionEvent
---

# `UIActivityViewControllerCompletionEvent`

**`UIActivityViewControllerCompletionEvent`** represents the system share sheet finishing, with what the user chose and whether it was done.

The [`complete`](ui-activity-view-controller/complete-event.md) event of [`UIActivityViewController`](ui-activity-view-controller.md) is this class.

**Inheritance**: [`Event`](event.md) → `UIActivityViewControllerCompletionEvent`

## Constructor

[`UIActivityViewControllerCompletionEvent()`](ui-activity-view-controller-completion-event/constructor.md)

Creates a `UIActivityViewControllerCompletionEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`activityType`](ui-activity-view-controller-completion-event/activitytype.md) <small>read-only</small> | Where the user chose to share |
| [`completed`](ui-activity-view-controller-completion-event/completed.md) <small>read-only</small> | Whether the chosen action was carried out |
| [`activityError`](ui-activity-view-controller-completion-event/activityerror.md) <small>read-only</small> | The error the system gave when the action failed |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UIActivityViewController`](ui-activity-view-controller.md) | [`complete`](ui-activity-view-controller/complete-event.md) |

It can't be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## Examples

```js
const sheet = new UIActivityViewController([new URL('https://example.com')]);
sheet.addEventListener('complete', (e) => {
  console.log(e instanceof UIActivityViewControllerCompletionEvent, e.completed, e.activityType);
});
```

**Effect**: when the sheet finishes, prints `true`, whether the action was done, and where the user chose to share.

## Corresponding iOS API

Of the four parameters of `UIActivityViewController.completionWithItemsHandler`, three are fields of the same names on the event object.

| ObjC | JS |
| --- | --- |
| `activityType` | `event.activityType` |
| `completed` | `event.completed` |
| `activityError` | `event.activityError` |

## See also

- [`UIActivityViewController`](ui-activity-view-controller.md): the object that fires this event
- [`complete`](ui-activity-view-controller/complete-event.md): when it is fired
