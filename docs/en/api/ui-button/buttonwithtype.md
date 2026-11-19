---
type: reference
native: "+[UIButton buttonWithType:]"
---

# `UIButton.buttonWithType()` static method

The **`UIButton.buttonWithType()`** static method creates a button of the given type. The type determines the button's default appearance and can't be changed after creation.

## Syntax

```
UIButton.buttonWithType(type)
```

### Parameters

**`type`**

The button type, one of the following strings:

| Value | Effect |
| --- | --- |
| `'system'` | A text button with the system appearance: blue title, fades while pressed, grays out when disabled (graying out when disabled is **not verified in the simulator**) |
| `'custom'` | The system draws nothing. Same as [`new UIButton()`](constructor.md) |
| `'close'` | A round close icon (×) |
| `'contactAdd'` | A plus icon |
| `'detailDisclosure'`, `'infoLight'`, `'infoDark'` | An info icon: an i inside a circle |

How `'close'`, `'contactAdd'`, `'detailDisclosure'`, `'infoLight'`, and `'infoDark'` look is **not verified in the simulator**.

### Return value

A new `UIButton`.

### Exceptions

**`TypeError`**

`type` is not one of the values in the table. The error message lists all valid values.

## Examples

```js
const button = UIButton.buttonWithType('system');
button.setTitle('Submit', { forState: ['normal'] });
console.log(button.buttonType);
```

**Result**

- You get a button with the blue title "Submit".
- The console prints `system`.

## Corresponding iOS API

`+[UIButton buttonWithType:]`. `UIButtonTypeSystem` is written as `'system'`, and likewise for the rest. `UIButtonTypePlain` (tvOS only) and `UIButtonTypeRoundedRect` (the old name for `system`) are not provided.

## See also

- [`buttonType`](buttontype.md): reading the button's type
- [`UIButton()`](constructor.md): creating a `custom` button
