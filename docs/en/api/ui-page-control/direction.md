---
type: reference
native: UIPageControl.direction
---

# `UIPageControl`: `direction` property

The **`direction`** property determines which direction the dots are laid out in, that is, which end page 0 is at.

## Value

A string, one of these five:

| Value | Effect |
| --- | --- |
| `'natural'` | Follows the writing direction of the system language: left to right for Chinese and English, right to left for Arabic |
| `'leftToRight'` | Horizontal, with page 0 at the far left |
| `'rightToLeft'` | Horizontal, with page 0 at the far right |
| `'topToBottom'` | Vertical, with page 0 at the top |
| `'bottomToTop'` | Vertical, with page 0 at the bottom |

- Readable and writable.
- Defaults to `'natural'`.
- When laid out vertically, the size given by [`sizeForNumberOfPages()`](sizefornumberofpages.md) also becomes narrow and tall; use it to set `frame` again. **Not verified in the simulator.**
- The on-screen effect of each value is **not verified in the simulator**.

### Invalid values

Writing a value not in the table doesn't throw: a warning listing all valid values is printed to the console, and the property keeps its previous value.

## Examples

```js
const pages = new UIPageControl();
pages.numberOfPages = 4;
pages.direction = 'topToBottom';
const size = pages.sizeForNumberOfPages(4);
pages.frame = new CGRect(0, 0, size.width, size.height);
```

**Effect**: The dots are arranged in a column from top to bottom, with page 0 at the top. **Not verified in the simulator.**

## Corresponding iOS API

`UIPageControl.direction`. `UIPageControlDirectionTopToBottom` is written as `'topToBottom'`, and likewise for the rest.

## See also

- [`sizeForNumberOfPages()`](sizefornumberofpages.md)
- [Enums](../enums.md)
