---
type: reference
native: UIControl.enabled
---

# `UIControl`: `isEnabled` property

The **`isEnabled`** property indicates whether the control receives touches. When set to `false`, the control enters the `disabled` [state](../ui-control.md#states).

## Value

A boolean.

| Value | Effect |
| --- | --- |
| `true` | The control receives touches and fires control events normally |
| `false` | The control does not receive touches and does not fire control events. [`state`](state.md) contains `'disabled'`. Subclasses such as buttons and switches look disabled; a `UIControl` created directly does not change its appearance |

- Readable and writable.
- Defaults to `true`.
- Writes are converted by JS truthiness: the string `'false'` is a non-empty string and gives `true`; `0` gives `false`.
- "Does not fire control events when disabled" is **not verified in the simulator**.

### Observing changes

No event fires when it changes. Only the app's code changes it, so no notification is needed.

## Examples

```js
const card = new UIControl();
card.isEnabled = false;
card.alpha = 0.4;
console.log(card.state.includes('disabled'));
```

**Result**: prints `true`. `card` becomes semi-transparent. A `UIControl` created directly does not change its appearance when disabled; to make it look disabled, change its appearance yourself.

## Corresponding iOS API

`UIControl.enabled`; its getter is `isEnabled`.

## See also

- [`state`](state.md): read all current states
- [States](../ui-control.md#states)
