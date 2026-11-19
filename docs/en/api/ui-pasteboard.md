---
type: reference
native: UIPasteboard
status: partial
---

# `UIPasteboard`

**`UIPasteboard`** represents the system clipboard. When the app writes a piece of text into it, the user can paste it in any app; text the user copied in another app can be read from it by the app.

There is only one system clipboard, shared by all apps. It is provided by the system and obtained from [`UIPasteboard.generalPasteboard`](ui-pasteboard/generalpasteboard.md).

Reading and writing both go through the [`string`](ui-pasteboard/string.md) property and are synchronous: once the assignment line has run, the text is on the clipboard; when the reading line returns, what you get is the content.

**Inheritance**: `EventTarget` → `NSObject` → `UIPasteboard`

For writing copy and paste buttons that do not disturb the user, see the guide [Copying and pasting text](../guides/clipboard.md).

## Constructor

Cannot be created with `new`. `new UIPasteboard()` throws `TypeError: Illegal constructor: UIPasteboard is created by the runtime, not by new`. Get the instance from [`UIPasteboard.generalPasteboard`](ui-pasteboard/generalpasteboard.md).

## Static properties

[`UIPasteboard.generalPasteboard`](ui-pasteboard/generalpasteboard.md) <small>read-only</small>

The clipboard shared by the whole system. Every read gives the same object.

## Instance properties

Also inherits the properties of `NSObject`.

| Property | Description |
| --- | --- |
| [`string`](ui-pasteboard/string.md) | The text on the clipboard. Reading it may show a [system prompt](#the-system-prompt-when-reading); writing replaces the existing content |
| [`hasStrings`](ui-pasteboard/hasstrings.md) <small>read-only</small> | Whether there is text on the clipboard. Only a query; no system prompt |
| [`changeCount`](ui-pasteboard/changecount.md) <small>read-only</small> | A count of content changes. Only a query; no system prompt |

## Events

Listen with `addEventListener()`.

| Event | When it fires |
| --- | --- |
| [`change`](ui-pasteboard/change-event.md) | This app itself changed the clipboard's content. Does not fire when another app changes it |

## The system prompt when reading

When reading [`string`](ui-pasteboard/string.md), if the clipboard's content was copied by the user in **another app**, the system first shows a prompt asking the user whether to allow this app to paste. **The line reading `string` does not return until the user responds.** During this time the app's code does not run: timers do not fire, event callbacks do not run, and the interface does not respond.

Measured once on a device (iPhone 14): reading content copied in another app, the line took 6613 milliseconds to return. That duration is the time from the user seeing the prompt to tapping a button; it depends on the user and has no upper limit.

| Situation | Is there a prompt |
| --- | --- |
| Reading `string`, content copied by another app | Yes (verified on a device) |
| Reading `string`, content written by this app itself | No. **Not verified on a device**; this comes from iOS's rules. In the simulator, reading its own content returns immediately |
| Reading `hasStrings` | No |
| Reading `changeCount` | No |
| Writing `string` | No |

What `string` reads when the user chooses not to allow in the prompt is **not verified in the simulator**. Whether this prompt appears in the simulator is **not verified in the simulator**.

So read `string` only when the user explicitly wants to paste; see [Recommended approach](../guides/clipboard.md#recommended-approach) in the guide.

## Examples

The following code starts from a blank app and puts a button on screen. Tapping it puts an order number on the clipboard.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const pasteboard = UIPasteboard.generalPasteboard;

  const button = UIButton.buttonWithType('system');
  button.setTitle('Copy Order Number', { forState: ['normal'] });
  button.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(button);

  button.addEventListener('click', () => {
    pasteboard.string = '20261112-0042';
    console.log('Copied');
  });
});
```

**Effect**

- A text button "Copy Order Number" appears near the top left of the screen.
- Tapping it prints `Copied` to the console.
- Switch to another app (such as Notes), long-press the input area, and choose "Paste": `20261112-0042` appears.

This code has not been run as a whole in the simulator. "Reading back what was written gives the same text" was checked in the acceptance tests; the step of pasting in another app is **not verified in the simulator**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `UIPasteboard.generalPasteboard` | `UIPasteboard.generalPasteboard` |
| `pasteboard.string = @"text"` | `pasteboard.string = 'text'` |
| `NSString *text = pasteboard.string` | `const text = pasteboard.string` |
| `pasteboard.hasStrings` | `pasteboard.hasStrings` |
| `pasteboard.changeCount` | `pasteboard.changeCount` |
| Observing `UIPasteboardChangedNotification` | `pasteboard.addEventListener('change', …)` |

Comparison with the browser:

| Browser | Nacre |
| --- | --- |
| `await navigator.clipboard.writeText('text')` | `pasteboard.string = 'text'`, synchronous |
| `await navigator.clipboard.readText()` | `pasteboard.string`, synchronous, and may freeze the interface while waiting for the user to respond |
| No equivalent | `pasteboard.hasStrings`, `pasteboard.changeCount` |

## See also

- [Copying and pasting text](../guides/clipboard.md): paste buttons, clearing, learning that the content changed
- [`UIButton`](ui-button.md): the button that triggers copying in the example
- [`application`](application.md): the `active` event, for checking `changeCount` when the app returns to the foreground
- [How the runtime works](how-it-works.md): why the whole interface freezes when one line of code does not return
