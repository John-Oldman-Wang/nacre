---
type: reference
native: "-[UIActivityViewController initWithActivityItems:applicationActivities:]"
---

# `UIActivityViewController()` constructor

The **`UIActivityViewController()`** constructor creates a share sheet with a set of items to share. The items can only be given at creation and can't be changed afterward.

## Syntax

```
new UIActivityViewController(activityItems)
```

### Parameters

**`activityItems`**

An array, required. Each element is one of these three:

| What you give | What the receiver gets |
| --- | --- |
| A string | A piece of text |
| A [`URL`](../url.md) object | A link |
| A [`UIImage`](../ui-image.md) | An image |

- Numbers and booleans are treated as strings: `5` is the same as `'5'`.
- The array can be empty; the system doesn't reject it. What the share sheet contains in that case is **not verified in the simulator**.

### Return value

A new `UIActivityViewController`. All three properties have their defaults: [`excludedActivityTypes`](excludedactivitytypes.md) is `null`, [`excludedActivitySectionTypes`](excludedactivitysectiontypes.md) is an empty array, and [`allowsProminentActivity`](allowsprominentactivity.md) is `true`.

### Exceptions

**`TypeError`**

- Not given, or not an array: `new UIActivityViewController: activityItems must be an array of strings, URLs and UIImages, got undefined` (what follows `got` is the value actually given).
- The array contains something that can't be shared (`null`, a plain object, a view, …): `activityItems[0] must be a string, a URL or a UIImage, got an object` (the number in brackets is the element's index).
- A second argument `{ applicationActivities }` is given: `new UIActivityViewController: applicationActivities is not supported yet`.

## Examples

```js
const sheet = new UIActivityViewController(['some text', new URL('https://example.com')]);
console.log(sheet.excludedActivityTypes);
```

**Result**: You get a share sheet, and the console prints `null`. The share sheet is shown only after being presented with [`presentViewController()`](../ui-view-controller/presentviewcontroller.md).

## Corresponding iOS API

`-[UIActivityViewController initWithActivityItems:applicationActivities:]`. `applicationActivities` (the app's own actions) isn't supported yet and must be omitted.

## See also

- [Sharing content](../../guides/share.md)
- [`complete`](complete-event.md): the event when the share sheet finishes
