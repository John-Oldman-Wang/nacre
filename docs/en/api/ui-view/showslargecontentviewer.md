---
type: reference
native: UIView.showsLargeContentViewer
---

# `UIView`: `showsLargeContentViewer` property

The **`showsLargeContentViewer`** property determines whether, when the user has a very large text size set and long-presses this view, an enlarged version is shown in the middle of the screen. It is meant for small controls that can't grow with the text, such as those in toolbars and tab bars.

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | Shows the enlarged version on long press, with content from [`largeContentTitle`](largecontenttitle.md) and [`largeContentImage`](largecontentimage.md) |
| `false` | Doesn't show it |

- Readable and writable.
- The default is **not verified in the simulator**.
- Written values are converted with `Boolean()`: `1`, non-empty strings, and objects are `true`; `0`, `''`, `null`, `undefined`, and `NaN` are `false`. So writing `'false'` gives `true`.
- The type that reads back, and that writing back the original value leaves it unchanged, are checked in the acceptance tests. The effect is **not verified in the simulator**.

## Examples

```js
const item = new UIView();
item.showsLargeContentViewer = true;
item.largeContentTitle = 'Favorites';
```

**Effect**: The reads and writes succeed. Whether the enlarged version appears on long press is **not verified in the simulator**.

## Corresponding iOS API

`UIView.showsLargeContentViewer`.

## See also

- [`largeContentTitle`](largecontenttitle.md), [`largeContentImage`](largecontentimage.md)
