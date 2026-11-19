---
type: reference
native: "+[ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:]"
---

# `ATTrackingManager.requestTrackingAuthorization()` static method

The **`ATTrackingManager.requestTrackingAuthorization()`** static method asks the user for tracking authorization and returns a Promise that fulfills with the authorization state after the request.

## Syntax

```
ATTrackingManager.requestTrackingAuthorization()
```

### Parameters

None.

### Return value

A `Promise` that fulfills with the authorization state after the request: one of `'notDetermined'`, `'restricted'`, `'denied'`, and `'authorized'`; see [The four authorization states](../app-tracking-transparency.md#the-four-authorization-states).

When the state is `'notDetermined'`, the system shows an alert. The alert's title and two buttons are provided by the system; the only thing the app decides is the sentence below the title (`NSUserTrackingUsageDescription`). After the user taps a button, the Promise fulfills with `'authorized'` or `'denied'`.

In the following cases the system does not show the alert, and the Promise fulfills immediately with the current state:

| Situation | Description |
| --- | --- |
| The user has already answered | The state is `'authorized'` or `'denied'` |
| The device is restricted | The state is `'restricted'` |
| The user turned off "Allow Apps to Request to Track" in the system's Settings → Privacy & Security → Tracking | No app can ask |
| The app is not active | [`application.state`](../application.md#foreground-background-and-run-state) is not `'active'`, for example just after the app launches, before the UI has appeared |
| A previous request is still waiting for the user's answer | The alert is being shown |

The alert and this table come from Apple's documentation and are **not verified in the simulator**.

An app has only one chance to show the alert: once the user has answered, asking again does not show it.

### Exceptions

Does not throw synchronously. On failure the Promise rejects with a `TypeError`:

- The app's Info.plist has no `NSUserTrackingUsageDescription`: `requestTrackingAuthorization needs NSUserTrackingUsageDescription in Info.plist; without it the system terminates the app`. A project generated with the CLI never gets here: generation already reports an error when this sentence is missing. This is for the case where you build your own Xcode project and drag the framework into it.
- The system answered with a state the runtime does not recognize (the system added a new state in a later version): `requestTrackingAuthorization: the system answered with a status this runtime does not know (…)`, with the system's numeric value in the parentheses.

## Examples

```js
ATTrackingManager.requestTrackingAuthorization().then(
  (status) => {
    console.log(status);
  },
  (err) => {
    console.log('The request was not sent: ' + err.message);
  },
);
```

**Effect**: When the state is `'notDetermined'`, the system alert appears, and after the user answers, prints `authorized` or `denied`; in all other cases no alert is shown and the current state is printed. When Info.plist has no `NSUserTrackingUsageDescription`, the second callback runs. **Not verified in the simulator.**

## Corresponding iOS API

`+[ATTrackingManager requestTrackingAuthorizationWithCompletionHandler:]`. The completion handler is replaced with a Promise.

## See also

- [`trackingAuthorizationStatus`](trackingauthorizationstatus.md): reading the current state without showing the alert
- [Requesting tracking authorization](../../guides/tracking-authorization.md): when to ask
- [Installing `@nacrejs/app-tracking-transparency`](../app-tracking-transparency.md#installation)
