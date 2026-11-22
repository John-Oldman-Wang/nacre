---
type: reference
native: UITextBeforeInputEvent.range
---

# `UITextBeforeInputEvent`: `range` property

The **`range`** property is the range that will be replaced.

## Value

An [`NSRange`](../ns-range.md). `location` is the start and `length` the length, both in UTF-16 code units, matching JS string indexes.

- Read-only. Assigning to it throws `TypeError`.
- When inserting, `length` is 0.
- When deleting, `length` is the length deleted.
- When pasting over a selection, it is the selected range.
- When the event is created with [`new`](constructor.md) without it, it is `null`.

## Examples

```js
const field = new UITextField();
field.addEventListener('beforeinput', (e) => {
  const next = field.text.slice(0, e.range.location) + e.replacementString +
    field.text.slice(e.range.location + e.range.length);
  console.log('改完会是', next);
});
```

**Effect**: before each edit, prints what the content will be afterward. Only real keyboard input fires it; **not verified in the simulator**.

## Corresponding iOS API

The `range` parameter of `textField:shouldChangeCharactersInRange:replacementString:` and `textView:shouldChangeTextInRange:replacementText:`.

## See also

- [`UITextBeforeInputEvent`](../ui-text-before-input-event.md)
