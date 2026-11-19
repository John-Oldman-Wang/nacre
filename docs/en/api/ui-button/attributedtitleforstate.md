---
type: reference
native: "-[UIButton attributedTitleForState:]"
---

# `UIButton`: `attributedTitleForState()` method

The **`attributedTitleForState()`** method returns the styled title the button uses in a given state.

## Syntax

```
attributedTitleForState(state)
```

### Parameters

**`state`**

One state name, a string: one of `'normal'`, `'highlighted'`, `'disabled'`, `'selected'`, `'focused'`.

Unlike the setter methods, only one state name can be passed here, not an array.

### Return value

[`NSAttributedString`](../ns-attributed-string.md), or `null`. Compare content with `isEqualToAttributedString()`.

When this state hasn't been set separately, it returns the one for the `normal` state. When `normal` hasn't been set either, it returns `null`.

### Exceptions

**`TypeError`**

`state` is not one of the state names above.

## Examples

```js
const button = UIButton.buttonWithType('system');
const title = new NSAttributedString('Submit', { foregroundColor: 'systemBlue' });
button.setAttributedTitle(title, { forState: ['normal'] });

const got = button.attributedTitleForState('disabled');
console.log(got !== null && got.isEqualToAttributedString(title));
```

**Result**: Prints `true`. `disabled` hasn't been set separately, so it returns the `normal` one.

## Corresponding iOS API

`-[UIButton attributedTitleForState:]`.

## See also

- [`setAttributedTitle()`](setattributedtitle.md)
- [`current…` properties](../ui-button.md#instance-properties): reading the one the button is displaying right now
