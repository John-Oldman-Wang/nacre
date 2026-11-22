---
type: reference
native: WebContentsWillNavigateEvent.navigationType
---

# `WebContentsWillNavigateEvent`: `navigationType` property

The **`navigationType`** property says what caused this navigation.

## Value

A string, one of:

- Read-only. Assigning to it throws `TypeError`.
- `'linkActivated'`: a link was tapped.
- `'formSubmitted'`: a form was submitted.
- `'backForward'`: the page's script went back or forward.
- `'reload'`: the page's script reloaded.
- `'formResubmitted'`: a form was resubmitted (**not verified in the simulator**).
- `'other'`: anything else; most often a script changing `location`.
- When the event is created with [`new`](constructor.md) without it, it is `'other'`.

## Examples

```js
const contents = new WebView().webContents;
contents.addEventListener('will-navigate', (e) => {
  if (e.navigationType === 'linkActivated') {
    console.log('用户点了链接', e.url);
  }
});
```

**Effect**: when the user taps a link in the page, prints `用户点了链接` and the URL.

## Corresponding iOS API

`navigationAction.navigationType`.

## See also

- [`WebContentsWillNavigateEvent`](../web-contents-will-navigate-event.md)
