---
type: reference
native: UIActivityViewController
status: partial
---

# `UIActivityViewController`

**`UIActivityViewController`** represents the system share sheet. The app hands it things to share (text, URLs, images); it rises from the bottom of the screen and lists the destinations that can receive them: other apps, AirDrop, and system actions such as "Copy", "Save to Photos", and "Print". The user chooses one, and the system takes care of delivering the items.

Which destinations appear in the share sheet is decided by the system, depending on the types of the items handed to it and the apps the user has installed. What the app can do is provide the content and exclude some of the system actions.

The share sheet is a [view controller](ui-view-controller.md), presented with the view controller's [`presentViewController()`](ui-view-controller/presentviewcontroller.md). When the share sheet finishes, it fires the [`complete`](ui-activity-view-controller/complete-event.md) event, telling the app whether the user shared and which destination was chosen.

> **Note:** Creation, reading and writing of properties, and errors were verified in the acceptance tests in the simulator (iPhone Air, iOS 27.2). How the share sheet looks on screen, when the `complete` event arrives, and what data it carries can only be verified by someone actually sharing, and are all **not verified in the simulator**.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIViewController`](ui-view-controller.md) → `UIActivityViewController`

For how to present the share sheet and handle the result, see the guide [Sharing content](../guides/share.md).

## Constructor

[`UIActivityViewController()`](ui-activity-view-controller/constructor.md)

Creates a share sheet with a set of items to share.

## Instance properties

Also inherits the properties of [`UIViewController`](ui-view-controller.md), such as `title` and `modalPresentationStyle`.

| Property | Description |
| --- | --- |
| [`excludedActivityTypes`](ui-activity-view-controller/excludedactivitytypes.md) | System actions that don't appear in the share sheet |
| [`excludedActivitySectionTypes`](ui-activity-view-controller/excludedactivitysectiontypes.md) | Whole sections to hide, such as the row of suggested contacts at the top |
| [`allowsProminentActivity`](ui-activity-view-controller/allowsprominentactivity.md) | Whether the system can show one action enlarged at the top of the share sheet |

## Instance methods

No methods of its own. Present it with [`presentViewController()`](ui-view-controller/presentviewcontroller.md) and close it from code with [`dismissViewController()`](ui-view-controller/dismissviewcontroller.md), both inherited from [`UIViewController`](ui-view-controller.md).

## Events

| Event | When it fires |
| --- | --- |
| [`complete`](ui-activity-view-controller/complete-event.md) | The share sheet has finished: the action the user chose is done, or the user closed the share sheet |
| [`beforedismiss`](ui-view-controller/beforedismiss-event.md), [`dismiss`](ui-view-controller/dismiss-event.md), [`dismissattempt`](ui-view-controller/dismissattempt-event.md) | Inherited from [`UIViewController`](ui-view-controller.md): the view controller's dismissal events |

Listening for names other than those in the table doesn't throw: such a name is treated as a custom event and only fires when you dispatch it yourself with `dispatchEvent()`.

## What can be shared

At construction, pass an array; each element is one of these three:

| What you give | What the receiver gets |
| --- | --- |
| A string | A piece of text |
| A [`URL`](url.md) object | A link |
| A [`UIImage`](ui-image.md) | An image |

- Numbers and booleans are treated as strings: `5` is the same as `'5'`.
- Anything else (`null`, plain objects, views, …) throws `TypeError`.
- The array can be empty; the system doesn't reject it. What the share sheet contains in that case is **not verified in the simulator**.

## When the share sheet finishes

The share sheet finishes in one of two ways:

- The user chose a destination, and that action finished (or failed).
- The user closed the share sheet without choosing: dragging it down, or tapping the close button.

In both cases the share sheet closes itself and then fires `complete` once. The app doesn't need to close it.

## Names of system actions

What you write in `excludedActivityTypes` and read from the `activityType` of the `complete` event are these names:

| Name | Action |
| --- | --- |
| `'copyToPasteboard'` | Copy |
| `'airDrop'` | AirDrop |
| `'message'` | Messages |
| `'mail'` | Mail |
| `'print'` | Print |
| `'saveToCameraRoll'` | Save to Photos |
| `'assignToContact'` | Assign to Contact |
| `'addToReadingList'` | Add to Safari's Reading List |
| `'openInIBooks'` | Open in Books |
| `'markupAsPDF'` | Markup as PDF |
| `'sharePlay'` | SharePlay |
| `'addToHomeScreen'` | Add to Home Screen |
| `'collaborationInviteWithLink'`, `'collaborationCopyLink'` | Collaboration: invite with a link, copy the collaboration link |
| `'postToFacebook'`, `'postToTwitter'`, `'postToWeibo'`, `'postToTencentWeibo'`, `'postToFlickr'`, `'postToVimeo'` | Post to the corresponding social network. These were built into the system in its early years; whether they still appear in current systems is **not verified in the simulator** |

The action labels in the table are what these actions are usually called in the system UI; **not verified in the simulator**.

When the user chooses a third-party app's share extension, `activityType` is that extension's own identifier, a dotted string not in this table.

## Examples

### Presenting the share sheet from a button

Starting from a blank app, put a button on the view controller; tapping it presents the share sheet.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const button = UIButton.buttonWithType('system');
  button.setTitle('Share', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  button.addEventListener('click', () => {
    const sheet = new UIActivityViewController([
      'This article is good',
      new URL('https://example.com/article'),
    ]);
    sheet.addEventListener('complete', (event) => {
      const { completed, activityType } =
        /** @type {UIActivityViewControllerCompletionEvent} */ (event);
      console.log(completed ? 'shared to ' + activityType : 'not shared');
    });
    page.presentViewController(sheet, { animated: true });
  });
});
```

**Effect** (**not verified in the simulator**)

- There is a button with blue text, "Share", near the top left of the view controller.
- Tap it, and the system share sheet rises from the bottom of the screen, listing the apps and system actions you can share to.
- Tap "Copy": the share sheet disappears and the console prints `shared to copyToPasteboard`.
- Without choosing anything, drag the share sheet down to dismiss it, and the console prints `not shared`.

For more techniques, see the guide [Sharing content](../guides/share.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIActivityViewController alloc] initWithActivityItems:@[@"text", url] applicationActivities:nil]` | `new UIActivityViewController(['text', url])` |
| `sheet.excludedActivityTypes = @[UIActivityTypePrint, UIActivityTypeAirDrop]` | `sheet.excludedActivityTypes = ['print', 'airDrop']` |
| `sheet.excludedActivitySectionTypes = UIActivitySectionTypesPeopleSuggestions` | `sheet.excludedActivitySectionTypes = ['peopleSuggestions']` |
| `sheet.allowsProminentActivity = NO` | `sheet.allowsProminentActivity = false` |
| `sheet.completionWithItemsHandler = ^(UIActivityType type, BOOL completed, NSArray *items, NSError *error) { … }` | `sheet.addEventListener('complete', (e) => { … })`<br>Of the callback's four parameters, `type`, `completed`, and `error` are the event object's `activityType`, `completed`, and `activityError`. `activityError` is an [`NSError`](ns-error.md) |
| `[self presentViewController:sheet animated:YES completion:nil]` | `page.presentViewController(sheet, { animated: true })` |

## See also

- [Sharing content](../guides/share.md): sharing images, excluding actions, handling the result
- [`UIViewController`](ui-view-controller.md): the share sheet's superclass. Presenting, dismissing, who presented whom
- [`URL`](url.md): the type for links
- [`UIImage`](ui-image.md): the type for images
- [`UIAlertController`](ui-alert-controller.md): the system alert, the other system view controller in the same group
- [Pasteboard](ui-pasteboard.md): when you only want to put text on the pasteboard, you don't need a share sheet
