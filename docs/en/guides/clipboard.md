# Copying and pasting text

This guide shows how to implement copy and paste with [`UIPasteboard`](../api/ui-pasteboard.md): put text on the system clipboard, read text the user copied, and read it without alarming the user. Details of each property are on the [`UIPasteboard`](../api/ui-pasteboard.md) reference page.

## Recommended approach

- **Write to the clipboard only when the user chooses "Copy".** The clipboard belongs to the user and may hold something they just copied. Don't write to it automatically at launch or in the background.
- **Read [`string`](../api/ui-pasteboard/string.md) only when the user explicitly wants to paste**, for example when they tap a "Paste" button in the app. Reading content that came from another app shows a system prompt, and the UI freezes until the user responds (see [The system prompt on read](../api/ui-pasteboard.md#the-system-prompt-when-reading)). When the user tapped a button, the prompt is expected, and during the few seconds the UI is frozen they are looking at the prompt.
- **Don't read `string` at launch, on returning to the foreground, or in a timer.** Otherwise the user sees an "Allow Paste" prompt as soon as they open the app, and the whole UI freezes until they respond.
- **To find out whether there is text to paste, read [`hasStrings`](../api/ui-pasteboard/hasstrings.md).** It only queries, without fetching the content, so no prompt appears. Use it to decide whether the "Paste" button is enabled.
- **To find out whether the content changed, compare [`changeCount`](../api/ui-pasteboard/changecount.md).** It doesn't fetch the content either.

## First example

Start from a blank app and add a "Copy" button and a "Paste" button.

```js
/** @type {UIPasteboard} */
const pasteboard = UIPasteboard.generalPasteboard;

application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const copy = UIButton.buttonWithType('system');
  copy.setTitle('Copy order number', { forState: ['normal'] });
  copy.frame = new CGRect(40, 120, 200, 44);
  page.view.addSubview(copy);
  copy.addEventListener('click', () => {
    pasteboard.string = '20261112-0042';
    console.log('Copied');
  });

  const paste = UIButton.buttonWithType('system');
  paste.setTitle('Paste', { forState: ['normal'] });
  paste.frame = new CGRect(40, 180, 200, 44);
  page.view.addSubview(paste);
  paste.addEventListener('click', () => {
    if (!pasteboard.hasStrings) {
      console.log('No text on the clipboard');
      return;
    }
    const text = pasteboard.string; // May show a system prompt; returns only after the user responds
    if (text !== null) {
      console.log('Pasted: ' + text);
    }
  });
});
```

**Effect**

- Two text buttons, "Copy order number" and "Paste", appear near the top left of the screen.
- Tapping "Copy order number" prints `Copied` to the console. Pasting in another app gives `20261112-0042`. **Pasting in another app is not verified in the simulator.**
- Tapping "Paste" when there is no text on the clipboard prints `No text on the clipboard`; the content isn't read and no prompt appears.
- Tapping "Paste" when there is text reads and prints it; when the content came from another app, the system shows a prompt first.

After reading `hasStrings`, you still need to check whether `string` is `null`: the content may change between the two reads.

This code has not been run as a whole in the simulator. "Text written reads back as the same text" is checked in the acceptance tests.

The sections below reuse `pasteboard` from here.

## Clear the clipboard

```js
pasteboard.string = null;
console.log(pasteboard.string, pasteboard.hasStrings);
```

**Result**: The clipboard is cleared, and the console prints `null false`.

This clears the entire system clipboard, including content the user copied in other apps.

## Did the content change while the user was away

When another app modifies the clipboard, this app receives no event. To know whether the content changed while the user was away, compare `changeCount` when returning to the foreground:

```js
let seen = pasteboard.changeCount;

application.addEventListener('active', () => {
  if (pasteboard.changeCount !== seen) {
    seen = pasteboard.changeCount;
    console.log('Clipboard content changed');
  }
});
```

**Result**: When the user switches to another app, copies something, and switches back, `Clipboard content changed` is printed.

This code reads only `changeCount`, so no system prompt appears. After detecting a change, don't go on to read `string`, or the user sees a prompt as soon as they return to the app. A good approach is to enable the "Paste" button and wait for the user to tap it.

## Get notified when your own code changes the clipboard

After the app writes `string` itself, the pasteboard fires a [`change`](../api/ui-pasteboard/change-event.md) event:

```js
pasteboard.addEventListener('change', () => {
  console.log('Changed, count is now ' + pasteboard.changeCount);
});

pasteboard.string = 'New content';
```

**Result**: Two lines `Changed, count is now …` are printed, with the same number in both. One write fires the event twice, so the work in the callback must tolerate running repeatedly.

## See also

- [`UIPasteboard`](../api/ui-pasteboard.md)
- [`UIButton`](../api/ui-button.md): the buttons in the example
- [`application`](../api/application.md): the `active` event
