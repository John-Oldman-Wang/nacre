---
type: reference
native: UIBarButtonItem target/action
---

# `UIBarButtonItem`: `click` event

The **`click`** event fires when the user taps this navigation bar button.

## Syntax

```
item.addEventListener('click', (event) => { })
```

## Event object

`Event`. It has only two fields, `type` and `target`; `target` is this button.

Not cancelable.

## When it fires

- Once per tap. Firing when a button on the right of the navigation bar is tapped has been verified with real taps in the acceptance tests.
- A disabled button ([`isEnabled`](../ui-bar-item/isenabled.md) is `false`) does nothing when tapped. **Not verified in the simulator.**
- The callback doesn't run synchronously at the moment of the tap; it runs later. See [How the runtime works](../how-it-works.md).
- The event name is the same as the tap event of [`UIButton`](../ui-button.md).
- Listening for other names doesn't throw: they're treated as custom events and fire only when you dispatch them yourself with `dispatchEvent()`.
- Listeners on a button don't need to be removed manually: when the view controller leaves the navigation stack and is collected, its buttons and listeners are collected with it.

## Examples

```js
const item = new UIBarButtonItem({ title: 'Done' });
item.addEventListener('click', (ev) => {
  console.log(ev.type, ev.target === item);
});
```

**Effect**: after the button is placed on the navigation bar, each tap prints `click true`.

## Corresponding iOS API

`target` and `action` of `UIBarButtonItem`. These two properties aren't exposed here; the `click` event replaces them.

## See also

- [`UIBarButtonItem()`](constructor.md)
