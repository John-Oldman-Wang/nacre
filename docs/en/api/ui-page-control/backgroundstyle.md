---
type: reference
native: UIPageControl.backgroundStyle
---

# `UIPageControl`: `backgroundStyle` property

The **`backgroundStyle`** property determines when the semi-transparent rounded background behind the dots is shown. With the background, the dots are legible on content of any color.

## Value

A string, one of these three:

| Value | Effect |
| --- | --- |
| `'automatic'` | No background normally; it appears when a finger presses on the dots |
| `'prominent'` | Always has a background |
| `'minimal'` | Never has a background |

- Readable and writable.
- Defaults to `'automatic'`.
- The on-screen effect of each value is **not verified in the simulator**.

### Invalid values

Writing a value not in the table doesn't throw; a warning is printed to the console and the property keeps its previous value.

```
[Nacre] backgroundStyle has no value "glass"; expected one of: automatic / prominent / minimal, ignored
```

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
pages.backgroundStyle = 'prominent';
console.log(pages.backgroundStyle);
```

**Effect**: Prints `prominent`. There is always a rounded background behind the dots. **How the background looks is not verified in the simulator.**

## Corresponding iOS API

`UIPageControl.backgroundStyle`. `UIPageControlBackgroundStyleProminent` is written as `'prominent'`, and likewise for the rest.

## See also

- [Enums](../enums.md): why an invalid property write warns instead of throwing
