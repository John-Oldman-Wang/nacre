# Sending local notifications

This guide shows how to make an app send notifications: asking the user for permission, scheduling when they're delivered, showing banners while the app is open, opening the matching page after the user taps a notification, and canceling and cleaning up. The entry point is [`UNUserNotificationCenter`](../api/un-user-notification-center.md); a notification is made of [content](../api/un-mutable-notification-content.md), a [trigger](../api/un-notification-trigger.md), and a [request](../api/un-notification-request.md), all in the `@nacrejs/user-notifications` package. First install the package as described in "Install first" on [`UNUserNotificationCenter`](../api/un-user-notification-center.md#installation).

The system behavior in this guide (the prompt, when notifications arrive, how banners look, when the two events arrive) is all **not verified in the simulator**.

## Recommended approach

- **Request authorization when the user does something that clearly calls for notifications** (sets a reminder, places an order), not right at launch: the user doesn't yet know what this app will send and will likely refuse, and after refusing you can't ask again.
- **You can call `requestAuthorizationWithOptions()` before every notification you send.** The prompt appears only once; after that, it resolves directly to the current result.
- **Set `foregroundPresentationOptions` in the `sceneconnect` callback.** Its default is `[]`, so notifications arriving while the app is open aren't shown; it lives only in memory, so set it on every launch.
- **To change a notification that hasn't arrived yet, submit a new request with the same identifier.** The system replaces the old one with the new one; you don't need to cancel first.
- **Carry data in `userInfo`, and open the page based on it in `notificationclick`.** Even when the tap launched the app, it still receives that tap.

## First example

Starting from a blank app, place a line of text and a button in the middle of the screen. Tapping the button requests authorization, then schedules a notification for 5 seconds later. When the notification arrives and when it is tapped, the text changes.

```js
/// <reference types="@nacrejs/types" />
/// <reference types="@nacrejs/user-notifications" />

const center = UNUserNotificationCenter.currentNotificationCenter();

application.addEventListener('sceneconnect', (e) => {
  // Show a banner, play a sound, and keep it in Notification Center even while the app is open. Without this there are only events
  center.foregroundPresentationOptions = ['banner', 'list', 'sound'];

  // Create the window and the page. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. A line of text and a button
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

  // 2. The two events
  center.addEventListener('notification', (event) => {
    label.text = 'Arrived: ' + event.notification.request.content.title;
  });
  center.addEventListener('notificationclick', (event) => {
    const info = event.response.notification.request.content.userInfo;
    label.text = 'Tapped: ' + String(info.what);
  });

  button.addEventListener('click', async () => {
    // 3. Request authorization. If already asked, it resolves to the current result on the spot without prompting again
    const granted = await center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
    if (!granted) {
      label.text = 'The user didn\'t allow notifications';
      return;
    }

    // 4. Content
    const content = new UNMutableNotificationContent();
    content.title = 'Time to drink water';
    content.body = 'It\'s been 5 seconds since your last glass';
    content.sound = UNNotificationSound.defaultSound;
    content.userInfo = { what: 'water' };

    // 5. Deliver in 5 seconds. The identifier is the same, so tapping several times gives only one
    const request = UNNotificationRequest.requestWithIdentifier('water-reminder', {
      content,
      trigger: UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(5),
    });
    try {
      await center.addNotificationRequest(request);
      label.text = 'Handed to the system; arriving in 5 seconds';
    } catch (err) {
      label.text = 'Not sent: ' + (err instanceof Error ? err.name : String(err));
    }
  });
});
```

**Effect** (**not verified in the simulator**)

- The middle of the screen shows "No notifications yet", with a blue "Remind me in 5 seconds" below it.
- The first time the button is tapped, the system shows a prompt asking whether to allow this app to send notifications.
- After the user allows it, the text becomes "Handed to the system; arriving in 5 seconds".
- 5 seconds later, a banner slides down from the top of the screen with the title "Time to drink water" and the body "It's been 5 seconds since your last glass", and a sound plays. The text becomes "Arrived: Time to drink water".
- Tap the banner, and the text becomes "Tapped: water".
- If you go back to the Home Screen within 5 seconds of tapping the button, the notification still arrives; the app isn't in the foreground then, so there is no `notification`. Tap the notification, the app returns to the foreground, and the text becomes "Tapped: water".
- If the user doesn't allow it, the text becomes "The user didn't allow notifications". Tapping the button again afterward doesn't show the prompt again.

The examples below reuse `center` from here. `content` is a `UNMutableNotificationContent` with its title already written. Snippets that use `await` go inside an `async` function. To try a section on its own, write this after the first few lines of the first example (bringing in types and getting `center`):

```js
const content = new UNMutableNotificationContent();
content.title = 'New order';
```

## Whether the user allows it

The app must get the user's permission before sending notifications. [`requestAuthorizationWithOptions(['alert', 'sound', 'badge'])`](../api/un-user-notification-center/requestauthorizationwithoptions.md) asks the user and returns a Promise that resolves to `true` (allowed) or `false` (denied).

- **The prompt appears only once.** On the first call, the system shows a prompt. Later calls don't prompt again and resolve directly to the current result.
- **After the user denies it, the app has no way to show the prompt again.** Only the user can change it, in the system Settings.
- **You can read the status without requesting.** [`getNotificationSettings()`](../api/un-user-notification-center/getnotificationsettings.md) shows nothing and resolves to a settings object whose `authorizationStatus` is `'notDetermined'` (not asked yet), `'denied'`, `'authorized'`, and so on.

Calling `addNotificationRequest()` without permission rejects the Promise with `name` `'NotAllowedError'`.

## Checking the status before requesting

```js
async function ensureAuthorized() {
  const settings = await center.getNotificationSettings();
  if (settings.authorizationStatus === 'authorized') return true;
  if (settings.authorizationStatus === 'denied') return false;
  return center.requestAuthorizationWithOptions(['alert', 'sound', 'badge']);
}
```

**Effect**: Resolves to `true` when already allowed and `false` when already denied, without a prompt in either case. When not asked yet, shows the prompt and resolves to the user's choice. When already denied, the app can explain in its own UI where to turn it on.

There is no event when the user changes the setting: changing it means leaving the app for the system Settings, so fetch it again in `application`'s [`active` event](../api/application.md) when the user comes back.

## Showing notifications while the app is open

When a notification arrives while the app is in the foreground, how it is presented is determined by [`foregroundPresentationOptions`](../api/un-user-notification-center/foregroundpresentationoptions.md). Its default is `[]`: **not presented**, with no banner, no sound, and nothing in Notification Center. In that case `center` fires the [`notification`](../api/un-user-notification-center/notification-event.md) event, and the app can handle it in its own UI.

To have the system present it as usual, write in the things you want:

```js
application.addEventListener('sceneconnect', () => {
  center.foregroundPresentationOptions = ['banner', 'list', 'sound'];
});
```

**Effect**: From then on, notifications arriving while the app is open slide down a banner from the top, play a sound, and stay in Notification Center. The event still fires.

This property is set ahead of time: when a notification arrives, the system handles it according to this value without waiting for JS event listeners. So you can't decide in a `notification` listener whether that notification is shown; see [Deciding based on the current screen](#deciding-based-on-the-current-screen).

> **Note:** Put this line inside a function. At the top level of a JS file, type checking (TypeScript 5.9.3) treats the array on the right as a plain string array and reports `Type 'string[]' is not assignable to type 'UNNotificationPresentationOptions[]'`. Running isn't affected.

## Sending one immediately

```js
async function notifyNow() {
  const content = new UNMutableNotificationContent();
  content.title = 'Download complete';
  content.body = 'report.pdf';
  await center.addNotificationRequest(
    UNNotificationRequest.requestWithIdentifier('download-done', { content }));
}
```

**Effect**: Without a `trigger`, the notification is delivered immediately. Whether it is shown while the app is in the foreground depends on `foregroundPresentationOptions`.

## Repeating at an interval

```js
const hourly = UNTimeIntervalNotificationTrigger.triggerWithTimeInterval(3600, { repeats: true });
```

**Effect**: Delivered an hour from now, then every hour until the request is canceled. The repeat interval must be at least 60 seconds; shorter than 60 seconds, this line throws `TypeError`.

## At a fixed time every day

```js
const everyMorning = UNCalendarNotificationTrigger.triggerWithDateMatchingComponents(
  { hour: 8, minute: 30 }, { repeats: true });
```

**Effect**: Delivered at 8:30 every day, in the time zone on the user's phone. Write only the components to match: `{ hour: 8, minute: 30 }` matches 8:30 on every day; adding `weekday: 2` matches only Mondays (1 is Sunday).

Remove `repeats`, and it is delivered only once, at the next 8:30. For all components, see [`triggerWithDateMatchingComponents()`](../api/un-calendar-notification-trigger/triggerwithdatematchingcomponents.md).

## At a specific moment

```js
/** @param {Date} when */
function triggerAt(when) {
  return UNCalendarNotificationTrigger.triggerWithDateMatchingComponents({
    year: when.getFullYear(),
    month: when.getMonth() + 1,
    day: when.getDate(),
    hour: when.getHours(),
    minute: when.getMinutes(),
    second: when.getSeconds(),
  });
}
const tomorrow = triggerAt(new Date(Date.now() + 24 * 3600 * 1000));
```

**Effect**: Delivered once at the moment `when`. `Date` months start at 0 while the date components' months start at 1, so add 1.

You can also use seconds: `triggerWithTimeInterval((when.getTime() - Date.now()) / 1000)`. The two differ after the user changes the phone's time or time zone: the seconds-based one is still "this long from now", while the date-components one follows the new clock.

## Carrying data and getting it back on tap

```js
content.userInfo = { screen: 'order', orderId: 'A1024' };

center.addEventListener('notificationclick', (event) => {
  const info = event.response.notification.request.content.userInfo;
  if (info.screen === 'order') {
    console.log('Open order', info.orderId);
  }
});
```

**Effect**: When the user taps this notification, it prints "Open order A1024".

`userInfo` values can only be strings, finite numbers, booleans, arrays, and plain objects. If it contains `null`, a `Date`, or a function, the assignment line throws `TypeError`, and the error says which one, for example `userInfo.a.b must be a string, number, boolean, array or plain object, got null`.

## When tapping a notification launches the app

When the user taps a notification, the app may not be running. The system launches the app and then hands over the tap. At that point JS may not have reached the `addEventListener` line yet, but the tap isn't lost: a tap that arrives with no listener is kept and delivered when `notificationclick` gets its first listener. At most 8 are kept; for the rules, see [`notificationclick`](../api/un-user-notification-center/notificationclick-event.md#when-it-fires).

So the listener can be added anywhere, for example after the home page is built:

```js
application.addEventListener('sceneconnect', () => {
  // …build the window and home page first
  center.addEventListener('notificationclick', (event) => {
    console.log('Opened from notification', event.response.notification.request.identifier);
  });
});
```

**Effect**: When the user launches the app by tapping a notification, this line is printed after the home page is built.

`notification` isn't kept: those arriving with no listener aren't delivered later.

## Deciding based on the current screen

```js
// On the chat page: notifications arriving during this time don't pop up; the page shows new messages itself
function onChatOpened() {
  center.foregroundPresentationOptions = [];
}
// Leaving the chat page: pop up as usual
function onChatClosed() {
  center.foregroundPresentationOptions = ['banner', 'list', 'sound'];
}
center.addEventListener('notification', (event) => {
  console.log('New message', event.notification.request.content.body);
});
```

**Effect**: Notifications arriving while the chat page is open show no banner and only print a line "New message …". Notifications arriving after leaving show a banner as usual and print the same line.

This property applies to all notifications; it can't apply to just one notification or one kind.

## Canceling one that hasn't arrived

```js
center.removePendingNotificationRequestsWithIdentifiers(['water-reminder']);
```

**Effect**: The notification with the identifier `water-reminder` is no longer delivered. A nonexistent identifier doesn't throw.

To change a notification that hasn't arrived yet, you don't need to cancel it first: submit another request with the same identifier, and the system replaces the old one with the new one.

## Clearing Notification Center and the badge on the icon

```js
async function clearAll() {
  center.removeAllDeliveredNotifications();
  await center.setBadgeCount(0);
}
```

**Effect**: All of this app's notifications disappear from Notification Center, and the number at the top right of the icon is removed. A common practice is to do both after the user has read their messages.

## Listing those that haven't arrived

```js
async function listPending() {
  const requests = await center.getPendingNotificationRequests();
  for (const request of requests) {
    const trigger = request.trigger;
    if (trigger instanceof UNTimeIntervalNotificationTrigger) {
      console.log(request.identifier, trigger.timeInterval + ' s', trigger.repeats);
    } else if (trigger instanceof UNCalendarNotificationTrigger) {
      console.log(request.identifier, JSON.stringify(trigger.dateComponents), trigger.repeats);
    }
  }
}
```

**Effect**: Prints one line per pending notification: identifier, trigger, and whether it repeats. Use `instanceof` to tell which kind of trigger it is.

## Receiving remote push notifications

```js
center.addEventListener('notificationclick', (event) => {
  const request = event.response.notification.request;
  if (request.trigger instanceof UNPushNotificationTrigger) {
    console.log('Push payload', JSON.stringify(request.content.userInfo));
  }
});
```

**Effect**: When the user taps a remote push notification, prints its payload, the JSON object the server sent. Remote push notifications go through the same two events as local notifications; the difference is that `trigger` is a [`UNPushNotificationTrigger`](../api/un-push-notification-trigger.md).

## See also

- [`UNUserNotificationCenter`](../api/un-user-notification-center.md): the entry point for notifications, and how to install this package
- [`UNMutableNotificationContent`](../api/un-mutable-notification-content.md): the content's fields
- [`UNTimeIntervalNotificationTrigger`](../api/un-time-interval-notification-trigger.md), [`UNCalendarNotificationTrigger`](../api/un-calendar-notification-trigger.md): the two triggers
- [`UNNotificationRequest`](../api/un-notification-request.md): requests and identifiers
- [`UNNotificationSettings`](../api/un-notification-settings.md): notification settings
