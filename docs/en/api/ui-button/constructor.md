---
type: reference
native: "-[UIButton init]"
---

# `UIButton()` constructor

The **`UIButton()`** constructor creates a button of type `custom`. The system gives a `custom` button no default appearance; you set the title color and the pressed look yourself.

For a button with the system appearance, use [`UIButton.buttonWithType('system')`](buttonwithtype.md).

## Syntax

```
new UIButton()
```

### Parameters

None.

### Return value

A new `UIButton`. Its [`buttonType`](buttontype.md) is `'custom'`. **Not verified in the simulator.**

A new button has no title, no image, and a width and height of 0 pt. Before adding it to a page, set its content and size; see [Why a new button is invisible](../../guides/buttons.md#why-a-new-button-is-invisible).

### Exceptions

None.

## Examples

```js
const button = new UIButton();
button.setTitle('Custom', { forState: ['normal'] });
button.setTitleColor('#007AFF', { forState: ['normal'] });
```

**Effect**: You get a button with the blue title "Custom". Its appearance doesn't change while a finger presses it. **Not verified in the simulator.**

## Corresponding iOS API

`[[UIButton alloc] init]`, equivalent to `[UIButton buttonWithType:UIButtonTypeCustom]`.

## See also

- [`UIButton.buttonWithType()`](buttonwithtype.md): creating a button with the system appearance
