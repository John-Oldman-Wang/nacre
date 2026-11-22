---
type: reference
native: WebContentsPageTitleUpdatedEvent.title
---

# `WebContentsPageTitleUpdatedEvent`: `title` property

The **`title`** property is the new title.

## Value

A string.

- Read-only. Assigning to it throws `TypeError`.
- At the moment of switching pages, it first becomes an empty string; the event fires again when the new page's title arrives. When using it as the navigation bar title, skip the empty string.
- When the event is created with [`new`](constructor.md) without it, it is an empty string.

## Examples

```js
const page = new UIViewController();
const contents = new WebView().webContents;
contents.addEventListener('page-title-updated', (e) => {
  if (e.title !== '') page.title = e.title;
});
```

**Effect**: once the page's title arrives, the view controller's title follows it.

## Corresponding iOS API

`title` of `WKWebView`, observed with key-value observing.

## See also

- [`WebContentsPageTitleUpdatedEvent`](../web-contents-page-title-updated-event.md)
