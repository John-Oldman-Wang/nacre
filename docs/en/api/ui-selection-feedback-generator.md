---
type: reference
native: UISelectionFeedbackGenerator
status: partial
---

# `UISelectionFeedbackGenerator`

**`UISelectionFeedbackGenerator`** represents a selection feedback generator: a very light tap of vibration when the selection moves from one item to another, such as a picker wheel turning one notch, a slider passing a tick mark, or the selected row of a list changing.

It only produces the vibration and knows nothing about what is selected in the UI. Your code calls [`selectionChanged()`](ui-selection-feedback-generator/selectionchanged.md) when the selection changes.

**Inheritance**: `EventTarget` → `NSObject` → [`UIFeedbackGenerator`](ui-feedback-generator.md) → `UISelectionFeedbackGenerator`

In the simulator, or when the user has turned off haptics, calls do not throw but produce no vibration; see [When there is no vibration](ui-feedback-generator.md#when-there-is-no-vibration).

## Constructor

It cannot be created with `new`; use [`UISelectionFeedbackGenerator.feedbackGeneratorForView()`](ui-selection-feedback-generator/feedbackgeneratorforview.md). Using `new` throws `TypeError`, and the message names the static method to use.

## Static methods

[`UISelectionFeedbackGenerator.feedbackGeneratorForView()`](ui-selection-feedback-generator/feedbackgeneratorforview.md)

Creates a generator bound to a view.

## Instance methods

Also inherits [`prepare()`](ui-feedback-generator/prepare.md) from [`UIFeedbackGenerator`](ui-feedback-generator.md).

| Method | Description |
| --- | --- |
| [`selectionChanged()`](ui-selection-feedback-generator/selectionchanged.md) | Vibrates very lightly once |

## Examples

```js
const page = new UIViewController();
const tick = UISelectionFeedbackGenerator.feedbackGeneratorForView(page.view);

/** @param {number} index */
function onSelect(index) {
  tick.selectionChanged();
  console.log('Selected item ' + index);
}

onSelect(2);
```

**Effect**: a very light vibration, and the console logs `Selected item 2`. **The vibration is not verified in the simulator.**

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UISelectionFeedbackGenerator feedbackGeneratorForView:view]` | `UISelectionFeedbackGenerator.feedbackGeneratorForView(view)` |
| `[generator selectionChanged]` | `generator.selectionChanged()` |

## See also

- [Making the phone vibrate](../guides/haptics.md)
- [`UIFeedbackGenerator`](ui-feedback-generator.md): the base class
