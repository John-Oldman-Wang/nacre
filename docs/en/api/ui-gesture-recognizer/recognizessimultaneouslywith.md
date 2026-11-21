---
type: reference
native: "UIGestureRecognizerDelegate gestureRecognizer:shouldRecognizeSimultaneouslyWithGestureRecognizer:"
---

# `UIGestureRecognizer`: `recognizesSimultaneouslyWith` property

The **`recognizesSimultaneouslyWith`** property lists the other recognizers that may recognize gestures at the same time as this one.

By default, once one recognizer recognizes a gesture in a touch, the other recognizers stop recognizing. For example, if a view inside a scroll view has a pan recognizer, then when the user drags that view, either this recognizer takes effect or the scroll view scrolls, never both. Put the other recognizer in this list and the two can recognize gestures at the same time, each firing its own events.

## Value

An array of [`UIGestureRecognizer`](../ui-gesture-recognizer.md).

- Readable and writable.
- The default is the empty array `[]`: recognizes simultaneously with no recognizer.
- Each read gives a new array; the recognizers in it are the same objects that were written (`===` holds). Changing the array you read does not change the setting; to change it, write a whole new array.
- Writing an empty array returns to the default: recognizes simultaneously with no recognizer.
- You can include UIKit's own recognizers, such as a scroll view's [`panGestureRecognizer`](../ui-scroll-view/pangesturerecognizer.md).
- When the system asks this recognizer whether it may recognize at the same time as another recognizer, the answer is yes if the other one is in the list and no if it is not. This answer does not call into JS and fires no event.
- If either of the two recognizers has the other in its list, the two can recognize at the same time (from the iOS definition). So writing it on the one you created is enough.
- The list does not keep the recognizers in it alive. Each recognizer is still kept by the view it is attached to; once it is garbage-collected, it disappears from the list.
- The system's answers after a write are verified in the acceptance suite: the test asks the recognizer the way the system does and asserts three cases: a recognizer in the list, one not in the list, and after clearing. Two gestures being recognized together under real touches, each firing its events, is **not verified with a real finger**.

### Invalid values

If an item in the array is not a recognizer (including `null`), or the value written is not an array, it throws `TypeError` and the existing list does not change:

```
recognizesSimultaneouslyWith needs an array of UIGestureRecognizer
```

### Only on recognizers you create

Only recognizers the app creates with `new` can have this property written. Writing a non-empty array on one of UIKit's own recognizers (such as a scroll view's `panGestureRecognizer`) throws `TypeError`, and the recognizer's behavior does not change:

```
recognizesSimultaneouslyWith is only available on gesture recognizers you create: this one belongs to UIKit (for example a scroll view's built-in pan) and its delegate cannot be replaced
```

To make your recognizer and a UIKit recognizer recognize together, write the property on yours and put the UIKit one in the array.

### Observing changes

No event fires when it changes. Only the app's code changes it, so no notification is needed.

## Examples

```js
const scroller = new UIScrollView();
const card = new UIView();
scroller.addSubview(card);

const pan = new UIPanGestureRecognizer();
pan.addEventListener('changed', () => {
  console.log('Dragging the card');
});
const scrollPan = scroller.panGestureRecognizer;
if (scrollPan !== null) {
  pan.recognizesSimultaneouslyWith = [scrollPan];
}
card.addGestureRecognizer(pan);
```

**Effect**: dragging on `card` scrolls the scroll view as usual, and at the same time `pan` fires `changed`, so the console keeps logging `Dragging the card`. Without this line, only one of them takes effect. **Not verified with a real finger.**

## Corresponding iOS API

`gestureRecognizer:shouldRecognizeSimultaneouslyWithGestureRecognizer:` of `UIGestureRecognizerDelegate`. In ObjC you set the recognizer's `delegate` and return `YES` or `NO` in this method depending on the other recognizer; here you list the recognizers that should get `YES` in the array.

## See also

- [Making two gestures work together](../../guides/gestures.md#making-two-gestures-work-together)
- [`beforebegin`](beforebegin-event.md): the other thing the system asks, whether to begin
- [`requireGestureRecognizerToFail()`](requiregesturerecognizertofail.md): the opposite, making one recognizer wait until another fails
- [Ownership](../ui-gesture-recognizer.md#ownership)
