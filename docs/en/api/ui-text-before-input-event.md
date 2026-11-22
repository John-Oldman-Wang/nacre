---
type: reference
native: UITextBeforeInputEvent
---

# `UITextBeforeInputEvent`

**`UITextBeforeInputEvent`** represents one change the user is making to the content of a text input, before the change takes effect.

The `beforeinput` event of both the single-line [`UITextField`](ui-text-field.md) and the multiline [`UITextView`](ui-text-view.md) is this class. It says which range the change will replace and with what; when a listener calls `preventDefault()`, the change isn't made.

**Inheritance**: [`Event`](event.md) → `UITextBeforeInputEvent`

## Constructor

[`UITextBeforeInputEvent()`](ui-text-before-input-event/constructor.md)

Creates a `UITextBeforeInputEvent`. The runtime creates one itself when it fires the events below; app code can use it to build an event object and fire it with [`dispatchEvent()`](event-target/dispatchevent.md) to try out a listener.

## Instance properties

Also inherits the properties of [`Event`](event.md); the most commonly used are `type` and `target`. The properties below are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`range`](ui-text-before-input-event/range.md) <small>read-only</small> | The range to be replaced |
| [`replacementString`](ui-text-before-input-event/replacementstring.md) <small>read-only</small> | The text to put in its place |

These properties live on the prototype, not on the event object itself: `Object.keys(event)` and `{ ...event }` don't include them, so read them one by one. See [Events with fields](event.md#events-with-fields).

## Events that use this class

| Object | Events |
| --- | --- |
| [`UITextField`](ui-text-field.md) | [`beforeinput`](ui-text-field/beforeinput-event.md) |
| [`UITextView`](ui-text-view.md) | [`beforeinput`](ui-text-view/beforeinput-event.md) |

It can be canceled: `cancelable` is `true`, and calling `preventDefault()` leaves the content unchanged. Listeners run on the spot; the system waits for all of them to finish before deciding whether to make the change.

## Examples

```js
const field = new UITextField();
field.addEventListener('beforeinput', (e) => {
  console.log(e instanceof UITextBeforeInputEvent, e.range.location, e.replacementString);
  const next = field.text.slice(0, e.range.location) + e.replacementString +
    field.text.slice(e.range.location + e.range.length);
  if (next.length > 6) {
    e.preventDefault();
  }
});
```

**Effect**: before each edit, prints `true`, the start of the change, and the replacement text. Changes that would make the content longer than 6 characters don't take effect. Only real keyboard input fires it.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `textField:shouldChangeCharactersInRange:replacementString:` | `beforeinput` of `UITextField` |
| `textView:shouldChangeTextInRange:replacementText:` | `beforeinput` of `UITextView` |
| The `range` parameter | `event.range` |
| The `string` or `text` parameter | `event.replacementString` |
| Returning `NO` | Calling `event.preventDefault()` |

## See also

- [`UITextField`](ui-text-field.md), [`UITextView`](ui-text-view.md): the objects that fire this event
- [Building a text field](../guides/text-fields.md)
