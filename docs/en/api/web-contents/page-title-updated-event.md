---
type: reference
native: WKWebView.title
---

# `WebContents`: `page-title-updated` event

The **`page-title-updated`** event fires when the web page's title changes.

## Syntax

```
contents.addEventListener('page-title-updated', (event) => {})
```

## Event object

[`WebContentsPageTitleUpdatedEvent`](../web-contents-page-title-updated-event.md). Besides `type` and `target`, it has one field:

| Field | Type | Meaning |
| --- | --- | --- |
| [`title`](../web-contents-page-title-updated-event/title.md) | string | The new title |

Not cancelable.

## When it fires

- When the page's `<title>` loads.
- When the page's script changes `document.title`.
- At the moment the page switches, it fires once with `title` as an empty string; it fires again when the new page's title arrives.

Whether the title or `did-finish-load` arrives first isn't fixed.

## Examples

```js
const page = new UIViewController();
const contents = new WebView().webContents;
contents.addEventListener('page-title-updated', (e) => {
  page.title = e.title;
});
contents.loadURL('https://example.com/');
```

**Effect**: The view controller's title follows the web page's title, ending as `Example Domain`.

## Differences from Electron

Electron writes `contents.on('page-title-updated', (event, title, explicitSet) => …)`; here the title is on `e.title`, there is no `explicitSet`, and it can't be canceled.

The corresponding native iOS member is `WKWebView.title`.

## See also

- [`getTitle()`](gettitle.md)
