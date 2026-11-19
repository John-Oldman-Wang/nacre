---
type: reference
native: "-[UITextView scrollRangeToVisible:]"
---

# `UITextView`: `scrollRangeToVisible()` method

The **`scrollRangeToVisible()`** method scrolls the text view until a range of text is visible.

## Syntax

```
scrollRangeToVisible(range)
```

### Parameters

**`range`**

The range to make visible: an [`NSRange`](../ns-range.md), or a plain object `{ location, length }`.

### Return value

None (`undefined`).

### Exceptions

**`TypeError`**

Invalid arguments produce the same errors as writing [`selectedRange`](selectedrange.md), with the prefix changed to `scrollRangeToVisible`. For example, a missing field: `scrollRangeToVisible is missing length, or it is not a finite number`.

## Description

A range beyond the content doesn't throw and doesn't scroll (measured).

## Examples

```js
const input = new UITextView();
input.frame = new CGRect(0, 0, 200, 60);
input.text = Array.from({ length: 40 }, (_, i) => '第 ' + (i + 1) + ' 行').join('\n');
input.scrollRangeToVisible(new NSRange(input.text.length, 0));
console.log(input.contentOffset.y > 0);
```

**Result**: logs `true`: it scrolled to the end of the content. Measured with a 200 × 60 pt text view holding 40 lines of the content above (each line reads "Line n" in Chinese), `contentOffset.y` went from 0 to 788 after the call.

## Corresponding iOS API

`-[UITextView scrollRangeToVisible:]`.

## See also

- [`contentOffset`](../ui-scroll-view/contentoffset.md)
