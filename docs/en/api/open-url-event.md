---
type: reference
native: UIOpenURLContext
status: partial
---

# `OpenURLEvent`

**`OpenURLEvent`** represents one occurrence of "this app was opened by a URL". It is the event object of the [`openurl`](application/openurl-event.md) event on [`application`](application.md), carrying the URL, which scene it was handed to, and which app it came from.

Both kinds of source use it: custom schemes (`myapp://…`) and universal links (`https://…`).

**Inheritance**: [`Event`](event.md) → `OpenURLEvent`

## Constructor

[`OpenURLEvent()`](open-url-event/constructor.md)

Construct one yourself to simulate an open in tests.

## Instance properties

Also inherits properties from [`Event`](event.md). For `openurl` fired by the runtime, `cancelable` is `false`.

| Property | Description |
| --- | --- |
| [`url`](open-url-event/url.md) <small>read-only</small> | The full URL from the system, as is |
| [`scene`](open-url-event/scene.md) <small>read-only</small> | Which scene the system handed this URL to |
| [`sourceApplication`](open-url-event/sourceapplication.md) <small>read-only</small> | The bundle ID of the source app |

## Examples

```js
application.addEventListener('openurl', (e) => {
  console.log(e instanceof OpenURLEvent, e.url);
});
```

**Effect** (**not verified in the simulator**): When the app is opened by `myapp://orders/42`, prints `true myapp://orders/42`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `UIOpenURLContext.URL`, `NSUserActivity.webpageURL` | `e.url` |
| `UIOpenURLContext.options.sourceApplication` | `e.sourceApplication` |

## See also

- [`openurl`](application/openurl-event.md)
- [Handling links that open the app](../guides/open-links.md)
