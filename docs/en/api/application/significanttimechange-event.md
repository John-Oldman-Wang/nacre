---
type: reference
native: UIApplicationSignificantTimeChangeNotification
---

# `Application`: `significanttimechange` event

The **`significanttimechange`** event fires when the time changes significantly: midnight passes, the time zone changes, or daylight saving time switches.

## Syntax

```
application.addEventListener('significanttimechange', (event) => { })
```

## Event object

`Event`. `target` is `application`. Not cancelable.

## When it fires

- When midnight passes, the time zone changes, or daylight saving time switches. UI that shows relative dates such as "today" and "yesterday" should refresh at this point.
- Firing of this event is **not verified in the simulator**.

## Examples

```js
application.addEventListener('significanttimechange', () => {
  console.log('Date changed, refresh the dates in the UI');
});
```

**Effect**: prints one line when midnight passes. **Not verified in the simulator.**

## Corresponding iOS API

`UIApplicationSignificantTimeChangeNotification`.

## See also

- [`Application`](../application.md#events)
