# Sharing content

This guide covers how to use the system share sheet [`UIActivityViewController`](../api/ui-activity-view-controller.md) to hand text, links, and images to other apps or system actions, and how to know whether the user shared.

## Recommended approach

- **Create a new share sheet for each share.** The items to share are given at creation and can't be changed afterward. What happens when the same share sheet is presented a second time is **not verified in the simulator**.
- **When sharing a web page, give a [`URL`](../api/url.md) object, not the address as a string.** With a string, the receiver gets a piece of text; with a `URL`, the receiver knows it is a link, and only then do link-only actions such as "Add to Reading List" appear. **Not verified in the simulator.**
- **Text and a link can be given together.** Each receiver takes what it needs: Messages puts both in, while "Copy" copies only one of them. Exactly what each destination takes is **not verified in the simulator**.
- **If you don't need to know the result, don't listen for [`complete`](../api/ui-activity-view-controller/complete-event.md).** The share sheet doesn't depend on a listener to work and closes itself when done.

## The first share sheet

Starting from a blank app, put a button on the view controller; tapping it presents the share sheet.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
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
    // 1. Create the share sheet and give it a piece of text and a link
    const sheet = new UIActivityViewController([
      'This article is good',
      new URL('https://example.com/article'),
    ]);

    // 2. Check the result when the share sheet finishes
    sheet.addEventListener('complete', (event) => {
      const { completed, activityType } = event;
      console.log(completed ? 'shared to ' + activityType : 'not shared');
    });

    // 3. Present it from the current view controller
    page.presentViewController(sheet, { animated: true });
  });
});
```

**Effect** (**not verified in the simulator**)

- There is a button with blue text, "Share", near the top left of the view controller.
- Tap it, and the system share sheet rises from the bottom of the screen, listing the apps and system actions you can share to.
- Tap "Copy": the share sheet disappears and the console prints `shared to copyToPasteboard`.
- Without choosing anything, drag the share sheet down to dismiss it, and the console prints `not shared`.

The examples below reuse `page` from here. To try a section on its own, start with these lines:

```js
const page = new UIViewController();
```

## Sharing an image

```js
const photo = UIImage.imageNamed('JS/assets/photo');
if (photo !== null) {
  const sheet = new UIActivityViewController([photo]);
  page.presentViewController(sheet, { animated: true });
}
```

**Effect** (**not verified in the simulator**): Image-only actions such as "Save Image" appear in the share sheet.

[`UIImage.imageNamed()`](../api/ui-image.md) returns `null` when it can't find the image, so check first.

## Keeping some system actions from appearing

```js
/** @type {UIActivityViewController} */
const linkSheet = new UIActivityViewController([new URL('https://example.com')]);
linkSheet.excludedActivityTypes = ['print', 'assignToContact', 'addToReadingList'];
page.presentViewController(linkSheet, { animated: true });
```

**Effect** (**not verified in the simulator**): The share sheet has no "Print", "Assign to Contact", or "Add to Reading List".

What can be excluded are the ones listed in [Names of system actions](../api/ui-activity-view-controller.md#names-of-system-actions). Share extensions from third-party apps can't be excluded. See [`excludedActivityTypes`](../api/ui-activity-view-controller/excludedactivitytypes.md).

## Hiding the row of contacts at the top

`linkSheet` is the link-sharing share sheet from the previous section:

```js
const linkSheet = new UIActivityViewController([new URL('https://example.com')]);
linkSheet.excludedActivitySectionTypes = ['peopleSuggestions'];
page.presentViewController(linkSheet, { animated: true });
```

**Effect** (**not verified in the simulator**): The top of the share sheet no longer shows contacts suggested by the system.

## Doing something after sharing

Again using the link-sharing share sheet `linkSheet`, listen for `complete` before presenting it:

```js
const linkSheet = new UIActivityViewController([new URL('https://example.com')]);
linkSheet.addEventListener('complete', (result) => {
  if (result.activityError !== null) {
    console.log('sharing failed: ' + result.activityError.message);
  } else if (result.completed) {
    console.log('shared; destination is ' + result.activityType);
  }
});
page.presentViewController(linkSheet, { animated: true });
```

**Effect** (**not verified in the simulator**)

- When the user completes the share, it prints the destination's name.
- When the action fails, it prints the error message.
- When the user simply closes the share sheet, nothing is printed.

The event object is a [`UIActivityViewControllerCompletionEvent`](../api/ui-activity-view-controller-completion-event.md); read the three fields directly.

- **After `complete`, the app doesn't know whether what was shared reached the other party.** `completed` being `true` only means the action finished, for example the user tapped send in Messages' compose screen.
- **Whether `complete` fires when the share sheet is closed by code is not verified in the simulator.** Put whatever needs to happen after [`dismissViewController()`](../api/ui-view-controller/dismissviewcontroller.md) right after that call, without relying on this event.

## See also

- [`UIActivityViewController`](../api/ui-activity-view-controller.md): all members of the share sheet
- [`UIViewController`](../api/ui-view-controller.md): presenting and dismissing view controllers
- [`URL`](../api/url.md), [`UIImage`](../api/ui-image.md): things you can share
- [Pasteboard](../api/ui-pasteboard.md): when you only want to put text on the pasteboard, you don't need a share sheet
