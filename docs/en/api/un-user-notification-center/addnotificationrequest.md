---
type: reference
native: "-[UNUserNotificationCenter addNotificationRequest:withCompletionHandler:]"
---

# `UNUserNotificationCenter`: `addNotificationRequest()` method

The **`addNotificationRequest()`** method hands a notification to the system. A request with a trigger is delivered when the time comes; one without is delivered immediately. Delivery does not require the app to be running.

## Syntax

```
addNotificationRequest(request)
```

### Parameters

**`request`**

A [`UNNotificationRequest`](../un-notification-request.md). Required.

### Return value

A `Promise` that fulfills with `undefined` once the system accepts the request. At that point the notification has not been delivered yet.

- If the identifier matches an existing one, that one is replaced.
- The system limits how many pending notifications it holds for one app at a time; Apple's documentation does not give the number.
- When the user has not allowed notifications, the promise is rejected with `name` `'NotAllowedError'`. **Not verified in the simulator.**
- For other rejections, see [Errors](../un-user-notification-center.md#errors).

### Exceptions

**`TypeError`**

Thrown synchronously when called without an argument or with something that is not a request:

```
addNotificationRequest: request must be a UNNotificationRequest, got undefined
```

## Examples

```js
const center = UNUserNotificationCenter.currentNotificationCenter();
const content = new UNMutableNotificationContent();
content.title = 'Download complete';
try {
  await center.addNotificationRequest(
    UNNotificationRequest.requestWithIdentifier('download-done', { content }));
  console.log('Handed to the system');
} catch (err) {
  console.log('Not sent: ' + /** @type {UNError} */ (err).name);
}
```

**Effect** (**not verified in the simulator**): without `trigger`, the notification is delivered immediately, and the console logs `Handed to the system`. Whether it is shown while the app is in the foreground depends on [`foregroundPresentationOptions`](foregroundpresentationoptions.md). When the user has not allowed notifications, logs `Not sent: NotAllowedError`.

## Corresponding iOS API

`-[UNUserNotificationCenter addNotificationRequest:withCompletionHandler:]`. The completion handler is replaced by a promise.

## See also

- [`UNNotificationRequest`](../un-notification-request.md): creating a request
- [`getPendingNotificationRequests()`](getpendingnotificationrequests.md): querying pending ones
- This class belongs to the `@nacrejs/user-notifications` package; see [Install first](../un-user-notification-center.md#installation)
