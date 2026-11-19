---
type: reference
native: "-[CNContactPickerDelegate contactPickerDidCancel:]"
---

# `CNContactPickerViewController`: `cancel` event

The **`cancel`** event fires when the user taps "Cancel" without picking anything.

## Syntax

```
picker.addEventListener('cancel', (event) => { })
```

## Event object

`Event`, with no extra fields. `target` is this picker. It can't be canceled; `preventDefault()` has no effect.

## When it fires

- The user tapped "Cancel". The system then dismisses the picker.
- Independent of the selection mode: it fires in all three modes.
- Once it fires, none of the three "picked" events will fire.
- Whether it fires when the picker is dismissed from code with `dismissViewController()` is not verified.

These behaviors are **not verified in the simulator**.

## Examples

```js
const page = new UIViewController();
const picker = new CNContactPickerViewController();
picker.addEventListener('contactselect', () => {
  console.log('Picked');
});
picker.addEventListener('cancel', () => {
  console.log('Nothing picked');
});
page.presentViewController(picker, { animated: true });
```

**Effect**: When the user taps "Cancel", the picker closes and the console prints `Nothing picked`.

## Corresponding iOS API

`-[CNContactPickerDelegate contactPickerDidCancel:]`.

## See also

- [When the picker finishes](../contacts.md#when-the-picker-finishes)
- [Installing `@nacrejs/contacts`](../contacts.md#installation)
