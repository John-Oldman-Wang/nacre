---
type: reference
native: UNUserNotificationCenter
status: partial
---

# `UNUserNotificationCenter`

**`UNUserNotificationCenter`** represents the entry point between this app and the system's notification features; there is only one per app. Through it you can ask the user whether the app may send notifications, hand a notification to the system and arrange when it is delivered, view and withdraw notifications you have handed over, and learn about two things: a notification arrived while the app was open; the user tapped a notification.

A **notification** is a message the system shows to the user on the app's behalf: a banner sliding down from the top of the screen, a line on the lock screen, an item in **Notification Center** (the list pulled down from the top of the screen). It can play a sound and can change the number at the top right of the app icon (the **badge**). Because the system shows notifications, they can be delivered even when the app is not running.

Notifications the app hands to the system itself are called **local notifications**. Those sent by a server through Apple's push service to the phone are called **remote push notifications**. This package sends local notifications; when a remote push notification arrives or is tapped, the app also learns of it through the same two events.

It belongs to the `@nacrejs/user-notifications` package. The other classes in the package are all parts of a notification:

| Class | What it represents |
| --- | --- |
| [`UNMutableNotificationContent`](un-mutable-notification-content.md) | The content of a notification you write yourself: title, body, sound, badge, data |
| [`UNNotificationContent`](un-notification-content.md) | Read-only content, read from requests and notifications |
| [`UNNotificationSound`](un-notification-sound.md) | The sound played when the notification arrives |
| [`UNNotificationTrigger`](un-notification-trigger.md) | The common parent of the three trigger types |
| [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md) | Delivered after a number of seconds |
| [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md) | Delivered at a certain date and time |
| [`UNPushNotificationTrigger`](un-push-notification-trigger.md) | This notification came from a remote push |
| [`UNNotificationRequest`](un-notification-request.md) | A notification to send: identifier, content, trigger |
| [`UNNotification`](un-notification.md) | A notification that has been delivered |
| [`UNNotificationResponse`](un-notification-response.md) | The action the user took on a notification |
| [`UNNotificationSettings`](un-notification-settings.md) | A snapshot of this app's notification settings |

The shapes of the members in this group, how arguments are converted, and the errors for invalid values come from the code and the acceptance tests. The system's behavior (the alert, when notifications arrive, what banners look like, when the two events come) comes from Apple's headers and documentation and is **not yet verified in the simulator**; each member page marks this where it applies.

**Inheritance**: `EventTarget` → `NSObject` → `UNUserNotificationCenter`

For how to request authorization, send notifications, and handle taps, see the guide [Sending local notifications](../guides/local-notifications.md).

## Installation

Notifications are not in the core; they are available only after installing the `@nacrejs/user-notifications` package. Without it, the global scope has no `UNUserNotificationCenter` or related classes, reading these names throws `ReferenceError`, and type checking reports that the names cannot be found.

This package needs no usage description in `nacre.config.json`: when asking the user, the alert's wording is the system's own. So there are only two steps.

**1. Install the package.**

```bash
npm install @nacrejs/user-notifications
```

**Effect**: the next time `ios/` is generated, the project embeds an extra `NacreUserNotifications.framework`. Projects that do not install it do not have it in their build output.

**2. Bring in the types.** Add a line at the top of the entry file:

```
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/user-notifications" />
```

**Effect**: `UNUserNotificationCenter` and the other classes get completion and checking in the editor. Without this line, `tsc` reports `Cannot find name 'UNUserNotificationCenter'`.

## Constructor

It cannot be created with `new` or subclassed. `new UNUserNotificationCenter()` throws `TypeError`:

```
Illegal constructor: UNUserNotificationCenter is created by the runtime, not by new
```

Get it from [`UNUserNotificationCenter.currentNotificationCenter()`](un-user-notification-center/currentnotificationcenter.md).

## Static methods

[`UNUserNotificationCenter.currentNotificationCenter()`](un-user-notification-center/currentnotificationcenter.md)

This app's notification center. Returns the same object every time.

## Instance properties

| Property | Description |
| --- | --- |
| [`foregroundPresentationOptions`](un-user-notification-center/foregroundpresentationoptions.md) | How notifications that arrive while the app is in the foreground are shown. Not shown by default |

## Instance methods

Authorization and settings:

| Method | Description |
| --- | --- |
| [`requestAuthorizationWithOptions()`](un-user-notification-center/requestauthorizationwithoptions.md) | Asks the user whether this app may send notifications |
| [`getNotificationSettings()`](un-user-notification-center/getnotificationsettings.md) | Reads the current notification settings without showing an alert |

Sending, querying, and withdrawing notifications:

| Method | Description |
| --- | --- |
| [`addNotificationRequest()`](un-user-notification-center/addnotificationrequest.md) | Hands a notification to the system |
| [`getPendingNotificationRequests()`](un-user-notification-center/getpendingnotificationrequests.md) | Notifications that have not arrived yet |
| [`removePendingNotificationRequestsWithIdentifiers()`](un-user-notification-center/removependingnotificationrequestswithidentifiers.md) | Withdraws pending ones by identifier |
| [`removeAllPendingNotificationRequests()`](un-user-notification-center/removeallpendingnotificationrequests.md) | Withdraws all pending ones |
| [`getDeliveredNotifications()`](un-user-notification-center/getdeliverednotifications.md) | Notifications delivered and still in Notification Center |
| [`removeDeliveredNotificationsWithIdentifiers()`](un-user-notification-center/removedeliverednotificationswithidentifiers.md) | Removes them from Notification Center by identifier |
| [`removeAllDeliveredNotifications()`](un-user-notification-center/removealldeliverednotifications.md) | Removes all of them from Notification Center |
| [`setBadgeCount()`](un-user-notification-center/setbadgecount.md) | Changes the number on the icon |

For methods that return a promise, invalid arguments **throw `TypeError` synchronously** rather than returning a rejected promise. Only failures reported by the system are rejections; see [Errors](#errors).

## Events

Listen with `addEventListener()`. Neither event is cancelable, and callbacks run in the next turn after the event occurs.

| Event | When it fires |
| --- | --- |
| [`notification`](un-user-notification-center/notification-event.md) | A notification arrived while the app was in the foreground |
| [`notificationclick`](un-user-notification-center/notificationclick-event.md) | The user tapped a notification. Also received when the app was launched by this tap |

Listening for other names does not throw: they are treated as custom events and fire only when you dispatch them yourself with `dispatchEvent()`.

## A notification is made of three things

| | What it is | Class |
| --- | --- | --- |
| **Content** | Title, body, sound, badge, data that travels with the notification | [`UNMutableNotificationContent`](un-mutable-notification-content.md) |
| **Trigger** | When it is delivered: after a number of seconds, or at a certain date and time. Without one, immediately | [`UNTimeIntervalNotificationTrigger`](un-time-interval-notification-trigger.md), [`UNCalendarNotificationTrigger`](un-calendar-notification-trigger.md) |
| **Request** | Combines the content and trigger and gives them an **identifier** | [`UNNotificationRequest`](un-notification-request.md) |

Hand the request to [`addNotificationRequest()`](un-user-notification-center/addnotificationrequest.md), and the system holds the notification. It then goes through three stages:

| Stage | How to query | How to withdraw |
| --- | --- | --- |
| **Pending**: handed to the system, trigger time not reached yet | `getPendingNotificationRequests()` | `removePendingNotificationRequestsWithIdentifiers()` |
| **Delivered**: shown, still in Notification Center | `getDeliveredNotifications()` | `removeDeliveredNotificationsWithIdentifiers()` |
| **User acted**: tapped it, and the app opened | The `notificationclick` event | — |

The identifier is the notification's name, chosen by the app. Withdrawing finds notifications by it; handing over another request with the same identifier makes the system replace the old one with the new one, so there are never two.

## Requests, contents, and triggers are values

[`UNNotificationRequest`](un-notification-request.md), [`UNNotificationContent`](un-notification-content.md), the three triggers, [`UNNotification`](un-notification.md), [`UNNotificationResponse`](un-notification-response.md), and [`UNNotificationSettings`](un-notification-settings.md) are all read-only values: their fields cannot be changed and no fields can be added; writing throws `TypeError`. The only one whose fields can be changed is [`UNMutableNotificationContent`](un-mutable-notification-content.md), which is for writing content.

- **Creating a request copies the content.** Changing the original content after `requestWithIdentifier()` leaves the created request unchanged. You can modify the same content object and create the next request from it.
- **What you read back from the system is a new object.** The requests from `getPendingNotificationRequests()` are not the same objects you handed over, though their contents are the same. Compare requests by `identifier`, not `===`.
- **Settings are a snapshot.** If the user later changes them in system settings, the `UNNotificationSettings` you hold does not change; get them again.

These values are plain JS objects that do not inherit from `NSObject` and can only be created by this package: apart from `UNMutableNotificationContent`, none can be created with `new`.

## Errors

When a promise-returning method is rejected, the error is called `UNError` in the type definitions. There are two kinds, by `name`:

| `name` | Meaning | Kind of error |
| --- | --- | --- |
| `'NotAllowedError'` | The user has not allowed this app to send notifications | [`DOMException`](dom-exception.md). The system's original error is in `cause`, an [`NSError`](ns-error.md): `cause.domain` is `'UNErrorDomain'` and `cause.code` is 1 |
| `'NSError'` | Other errors reported by the system; check `code`. Apple's headers list 1400 (the trigger cannot compute the next time), 1401 (the notification has no content), and 1600 (invalid badge number) | [`NSError`](ns-error.md). `code` is the system error code and `domain` is the system error domain; notification errors are `'UNErrorDomain'` |

Which error code the system reports in which situation is **not verified in the simulator**.

## Examples

### A reminder in 5 seconds

Starting from a blank app, put a line of text and a button in the middle of the screen. Tapping the button requests authorization, then arranges for a notification to be delivered in 5 seconds. The line of text changes when the notification arrives and when it is tapped.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/user-notifications" />

const center = UNUserNotificationCenter.currentNotificationCenter();

application.addEventListener('sceneconnect', (e) => {
  // Show a banner, play a sound, and keep it in Notification Center even while the app is open. Without this there are only events
  center.foregroundPresentationOptions = ['banner', 'list', 'sound'];

  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.text = 'No notifications yet';
  label.numberOfLines = 0;
  label.textAlignment = 'center';
  const button = UIButton.buttonWithType('system');
  button.setTitle('Remind me in 5 seconds', { forState: ['normal'] });
  for (const view of [label, button]) {
    view.translatesAutoresizingMaskIntoConstraints = false;
    page.view.addSubview(view);
  }
  NSLayoutConstraint.activateConstraints([
    label.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    button.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    button.topAnchor.constraintEqualToAnchor(label.bottomAnchor, { constant: 16 }),
  ]);

  center.addEventListener('notification', (event) => {
    label.text = 'Arrived: ' + event.notification.request.content.title;
  });
  center.addEventListener('notificationclick', (event) => {
    const info = event.response.notification.request.content.userInfo;
    label.text = 'Tapped: ' + String(info.what);
  });

  button.addEventListener('click', async () => {
    const granted = await center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
    if (!granted) {
      label.text = 'Notifications not allowed';
      return;
    }

    const content = new UNMutableNotificationContent();
    content.title = 'Time for water';
    content.body = '5 seconds since your last glass';
    content.sound = UNNotificationSound.defaultSound;
    content.userInfo = { what: 'water' };

    const request = UNNotificationRequest.requestWithIdentifier('water-reminder', {
      content,
      trigger: UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5),
    });
    try {
      await center.addNotificationRequest(request);
      label.text = 'Handed to the system; arrives in 5 seconds';
    } catch (err) {
      label.text = 'Not sent: ' + (err instanceof Error ? err.name : String(err));
    }
  });
});
```

**Effect** (**not verified in the simulator**)

- The middle of the screen shows "No notifications yet", with a blue "Remind me in 5 seconds" below it.
- The first time the button is tapped, the system shows an alert asking whether to allow this app to send notifications.
- After the user allows it, the text changes to "Handed to the system; arrives in 5 seconds".
- 5 seconds later, a banner slides down from the top of the screen with the title "Time for water" and the body "5 seconds since your last glass", and a sound plays. The text changes to "Arrived: Time for water".
- Tapping the banner changes the text to "Tapped: water".
- If you go back to the home screen within 5 seconds of tapping the button: the notification still arrives, and since the app is not in the foreground, there is no `notification`. Tapping the notification brings the app back to the foreground, and the text changes to "Tapped: water".
- If the user does not allow it, the text changes to "Notifications not allowed". Tapping the button again does not show the alert again.

For more patterns (a fixed time every day, withdrawing, badges, remote push), see the guide [Sending local notifications](../guides/local-notifications.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UNUserNotificationCenter currentNotificationCenter]` | `UNUserNotificationCenter.currentNotificationCenter()` |
| `[center requestAuthorizationWithOptions:UNAuthorizationOptionAlert \| UNAuthorizationOptionSound completionHandler:^(BOOL granted, NSError *error) { … }]` | `center.requestAuthorizationWithOptions(['alert', 'sound'])`, returns `Promise<boolean>` |
| `[center getNotificationSettingsWithCompletionHandler:^(UNNotificationSettings *settings) { … }]` | `center.getNotificationSettings()`, returns a promise |
| `[center addNotificationRequest:request withCompletionHandler:^(NSError *error) { … }]` | `center.addNotificationRequest(request)`, returns a promise |
| `[center getPendingNotificationRequestsWithCompletionHandler:…]` | `center.getPendingNotificationRequests()`, returns a promise |
| `[center removePendingNotificationRequestsWithIdentifiers:@[@"water"]]` | `center.removePendingNotificationRequestsWithIdentifiers(['water'])` |
| `[center removeAllPendingNotificationRequests]` | `center.removeAllPendingNotificationRequests()` |
| `[center getDeliveredNotificationsWithCompletionHandler:…]` | `center.getDeliveredNotifications()`, returns a promise |
| `[center removeDeliveredNotificationsWithIdentifiers:@[@"water"]]` | `center.removeDeliveredNotificationsWithIdentifiers(['water'])` |
| `[center removeAllDeliveredNotifications]` | `center.removeAllDeliveredNotifications()` |
| `[center setBadgeCount:3 withCompletionHandler:…]` | `center.setBadgeCount(3)`, returns a promise |
| `center.delegate = self` | Not needed; use `addEventListener` |
| `userNotificationCenter:willPresentNotification:withCompletionHandler:` | The `notification` event, `event.notification` |
| Calling `completionHandler(UNNotificationPresentationOptionBanner \| UNNotificationPresentationOptionSound)` in the method above | Set `center.foregroundPresentationOptions = ['banner', 'sound']` in advance |
| `userNotificationCenter:didReceiveNotificationResponse:withCompletionHandler:` | The `notificationclick` event, `event.response` |
| `error.code == UNErrorCodeNotificationsNotAllowed` | `error.name === 'NotAllowedError'`; the system's `NSError` is in `error.cause` |

## See also

- [Sending local notifications](../guides/local-notifications.md): requesting authorization, trigger types, handling taps, withdrawing, badges
- [Core and capability packages](capabilities.md): which capabilities must be installed separately
- [`Application`](application.md): the `active` event, for rereading notification settings when the app returns to the foreground
- [Enums](enums.md): why authorization statuses and options are strings and string arrays, and what happens when they are misspelled
- [How the runtime works](how-it-works.md): why event callbacks run in the next turn
