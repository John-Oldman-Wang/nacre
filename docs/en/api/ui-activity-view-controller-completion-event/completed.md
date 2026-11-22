---
type: reference
native: UIActivityViewControllerCompletionEvent.completed
---

# `UIActivityViewControllerCompletionEvent`: `completed` property

The **`completed`** property tells whether the action the user chose was carried out.

## Value

A boolean.

- Read-only. Assigning to it throws `TypeError`.
- `true`: the action was carried out, for example the user tapped Send in the Messages compose screen. Whether the shared item reached anyone is unknown to the app.
- `false`: nothing was done, including when the user simply closed the sheet.
- When the event is created with [`new`](constructor.md) without it, it is `false`.

## Examples

```js
const sheet = new UIActivityViewController(['你好']);
sheet.addEventListener('complete', (e) => {
  console.log(e.completed ? '分享完成' : '没有分享');
});
```

**Effect**: when the sheet finishes, prints `分享完成` or `没有分享` depending on the result. **Not verified in the simulator.**

## Corresponding iOS API

The `completed` parameter of `completionWithItemsHandler`.

## See also

- [`UIActivityViewControllerCompletionEvent`](../ui-activity-view-controller-completion-event.md)
