---
type: reference
native: UIControlEventMenuActionTriggered
---

# `UIControl`: `menuaction` event

The **`menuaction`** event fires before a control that has a menu shows the menu.

## Syntax

```
addEventListener('menuaction', (event) => { })
```

## Event object

A plain `Event` with no fields other than `type` and `target`. It has no touch location: reading `location` gives `undefined`.

It cannot be canceled: `cancelable` is `false`, and `preventDefault()` has no effect.

## When it fires

- No control fires it as a result of a user action.
- You can listen for it without an error. `sendActionsForControlEvents(['menuaction'])` makes it fire.
- When it fires is **not verified in the simulator**.

## Examples

```js
const card = new UIControl();
card.addEventListener('menuaction', () => {
  console.log('menuaction');
});
card.sendActionsForControlEvents(['menuaction']);
```

**Effect**: The console prints `menuaction`. **Not verified in the simulator.**

## Corresponding iOS API

`UIControlEventMenuActionTriggered`. Natively it is registered with `addTarget:action:forControlEvents:`; here, use [`addEventListener()`](addeventlistener.md).

## See also

- [`UIControl`](../ui-control.md)
