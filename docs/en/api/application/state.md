---
type: reference
native: UIApplication.applicationState
---

# `Application`: `state` property

The **`state`** property is the app's foreground/background state: the state of all scenes combined. For a single scene's state, read [`UIWindowScene.activationState`](../ui-window-scene/activationstate.md).

## Value

A string:

| Value | Meaning |
| --- | --- |
| `'active'` | In the foreground and receiving user input |
| `'inactive'` | In the foreground but temporarily not receiving input. For example, while switching apps, during an incoming call, or with Notification Center pulled down |
| `'background'` | Not on screen. This is also the value when the script starts running |
| `'unknown'` | The system returned a state value the runtime doesn't recognize. Not seen under normal conditions |

- Read-only. Assigning to it throws `TypeError`.
- Reads `'background'` at the top level of `main.js`: when the script starts running, no scene has connected yet, and the system considers the app not yet in the foreground. Read it after the UI is displayed and the app is usable to get `'active'`.
- Fires [`inactive`](inactive-event.md), [`background`](background-event.md), [`foreground`](foreground-event.md), and [`active`](active-event.md) when it changes. `inactive` and `foreground` mean "about to", so `state` is still the old value when they arrive; see [Foreground, background, and run state](../application.md#foreground-background-and-run-state).

## Examples

```js
console.log(application.state);
```

**Result**: prints `background` when run at the top level of `main.js`.

## Corresponding iOS API

`UIApplication.applicationState`. `UIApplicationStateActive` is written as `'active'`, and likewise for the rest.

## See also

- [Foreground, background, and run state](../application.md#foreground-background-and-run-state)
