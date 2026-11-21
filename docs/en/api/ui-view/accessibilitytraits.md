---
type: reference
native: UIView.accessibilityTraits
---

# `UIView`: `accessibilityTraits` property

The **`accessibilityTraits`** property says what kind of thing this element is and what state it is in: a button, a heading, an image, selected, unavailable, and so on. VoiceOver uses it to decide how to read the element and how the user can operate it.

VoiceOver is the screen reader built into iOS; see [`isAccessibilityElement`](isaccessibilityelement.md).

## Value

An array of strings, each one of the names below. An element can have several traits at once, such as `['button', 'selected']`. An empty array means no traits.

The meaning and effect of each trait come from Apple's documentation; how VoiceOver actually reads them is **not verified on a device**.

What the element is:

| Value | Meaning |
| --- | --- |
| `'button'` | A button. After the name, VoiceOver says it is a button |
| `'link'` | A link; activating it opens a URL or another page |
| `'header'` | A heading, the start of a section of content. VoiceOver users can jump from heading to heading to find content |
| `'searchField'` | A search field |
| `'image'` | An image |
| `'staticText'` | Text that doesn't change |
| `'keyboardKey'` | A key on a keyboard |
| `'tabBar'` | A group of tabs used to switch between several pages. Put it on the view that holds the tabs; that view's own `isAccessibilityElement` should be `false`, and each tab inside is an element |
| `'toggleButton'` | A toggle button; each tap switches it between on and off |
| `'summaryElement'` | An element that summarizes the current situation when the app starts, such as the current temperature in a weather app. VoiceOver reads it first when the app starts |

What state it is in:

| Value | Meaning |
| --- | --- |
| `'selected'` | Selected, such as the current tab in a group of tabs. VoiceOver says it is selected |
| `'notEnabled'` | Unavailable. VoiceOver says it is unavailable |
| `'updatesFrequently'` | The value changes very often, such as a timer. VoiceOver doesn't read every change |

How it is operated:

| Value | Meaning |
| --- | --- |
| `'adjustable'` | A value that can be raised or lowered, such as a slider (`UISlider` has this trait on its own) |
| `'allowsDirectInteraction'` | The user operates it directly with a finger, and VoiceOver doesn't intercept the touches, such as a drawing canvas or the keys of a musical instrument |
| `'playsSound'` | It plays its own sound when activated, so VoiceOver doesn't play its own feedback sound |
| `'startsMediaSession'` | Activating it starts playback or recording. VoiceOver stays silent when activating it, so its voice doesn't end up in the recording |
| `'causesPageTurn'` | During continuous reading, VoiceOver turns to the next page after reading this element |
| `'supportsZoom'` | It can be zoomed in and out |

- Readable and writable.
- On `UIView` the default is an empty array `[]`. System controls come with their own traits: a `UIButton`'s traits include `'button'`, and a `UILabel`'s include `'staticText'` (measured).
- Each read returns a new array. The order in the array is a fixed internal order of the system, not the order in which the names were written. Use `includes()` to check for a trait, and sort two sets of traits before comparing them.
- The array you write replaces all the existing traits; it doesn't append. To add one to the existing traits, read them first: `[...view.accessibilityTraits, 'selected']`.
- Writing an empty array removes all traits.
- System controls may also carry traits that aren't in the tables above and have no name. They can't be read, and writing leaves them in place; they are not removed.
- Other iterables, such as a `Set`, are also accepted on write.
- There is no change event: apart from the traits system controls come with, only the app's own code changes it.

### Invalid values

If the array contains even one name it doesn't recognize, the whole assignment has no effect: nothing is thrown, the console prints a warning listing all the valid values, and the property keeps its previous value (measured).

```
accessibilityTraits has no value "heading"; expected one of: …
```

Writing something that isn't an array throws a `TypeError`, and the property keeps its previous value (measured):

```
TypeError: accessibilityTraits must be an array of trait names, got "button"
```

## Examples

### Marking a line of text as a heading

```js
const title = new UILabel();
title.text = 'Recent orders';
title.accessibilityTraits = ['header'];
console.log(title.accessibilityTraits.join(','));
```

**Effect**: The console prints `header`. The `'staticText'` the `UILabel` had is replaced. VoiceOver reads "Recent orders" and says it is a heading, and the user can jump here by heading. **How VoiceOver reads it is not verified on a device.**

### Changing traits along with the selection state

```js
const tab = new UIView();
tab.isAccessibilityElement = true;
tab.accessibilityLabel = 'All';

/** @param {boolean} selected */
function setSelected(selected) {
  tab.accessibilityTraits = selected ? ['button', 'selected'] : ['button'];
}
setSelected(true);
console.log(tab.accessibilityTraits.includes('selected'));
```

**Effect**: The console prints `true`. When VoiceOver stops here it reads "All" and says it is selected and is a button. **How VoiceOver reads it is not verified on a device.**

## Corresponding iOS API

`accessibilityTraits`. In iOS it belongs to the `UIAccessibility` protocol and is a bitmask; in JS it exists only on `UIView` and its subclasses. Constants drop the `UIAccessibilityTrait` prefix and start lowercase: `UIAccessibilityTraitButton | UIAccessibilityTraitSelected` is written `['button', 'selected']`. `UIAccessibilityTraitNone` is written as an empty array.

## See also

- [Making VoiceOver read your interface correctly](../../guides/accessibility.md#choosing-traits): how to choose traits
- [Enums](../enums.md): bitmasks are written as arrays of strings, and invalid property values are warnings
