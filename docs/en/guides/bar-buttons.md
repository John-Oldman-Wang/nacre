# Putting buttons and a title in the navigation bar

This guide shows how to set up what appears in the navigation bar: the title in the middle, buttons on the right and left, and the back button. Three classes are involved: the view controller's configuration [`UINavigationItem`](../api/ui-navigation-item.md), the button [`UIBarButtonItem`](../api/ui-bar-button-item.md), and their shared parent class [`UIBarItem`](../api/ui-bar-item.md). The navigation bar itself is displayed by [`UINavigationController`](../api/ui-navigation-controller.md).

## Recommended approach

- **Set the title only with `page.title`.** The title has two entry points: [`page.title`](../api/ui-view-controller/title.md) and [`page.navigationItem.title`](../api/ui-navigation-item/title.md). Writing `page.title` also changes `navigationItem.title`, but not the other way around, and once `navigationItem.title` has been written directly the two may disagree; see [The two title entry points](../api/ui-navigation-item.md#two-ways-to-set-the-title). Using only `page.title` has two benefits: the back button's text comes from it, and when the view controller is placed in a [`UITabBarController`](../api/ui-tab-bar-controller.md), the tab the system creates automatically uses it too. You need `navigationItem` only when the title in the navigation bar should differ from the text on the back button; in that case set `backButtonTitle`, and you still don't need to write `navigationItem.title`.
- **Create buttons in the function that builds the view controller, and set them before pushing.** Buttons are part of the view controller's configuration; they are created with it and garbage-collected with it. Listeners added to buttons don't need to be removed by hand: when the view controller leaves the navigation stack and is collected, its buttons and their listeners are collected with it.
- **For view controllers in a navigation stack, prefer the right side for buttons.** The left side is where the back button goes. Once a view controller sets left buttons, both the back button and swipe-to-go-back are affected; see [Left buttons and going back](#left-buttons-and-going-back). Left buttons suit cases with no previous view controller, such as "Cancel" in the top-left corner of a modally presented view controller.

## First navigation bar button

Start from a blank app: the home view controller has a button that opens an "Edit" view controller; the "Edit" navigation bar has a "Save" button on the right that prints a line to the console and returns to the home view controller.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window, home view controller, and navigation controller
  const win = new UIWindow(e.scene);
  const home = new UIViewController();
  home.title = 'Home';
  home.view.backgroundColor = 'systemBackground';
  const nav = new UINavigationController(home);
  win.rootViewController = nav;
  win.makeKeyAndVisible();

  function makeEditor() {
    const page = new UIViewController();
    // 1. Title: the text in the middle of the navigation bar
    page.title = 'Edit';
    page.view.backgroundColor = 'systemBackground';

    // 2. Create a button
    const save = new UIBarButtonItem({ title: 'Save', style: 'prominent' });

    // 3. What to do when tapped
    save.addEventListener('click', () => {
      console.log('Saved');
      nav.popViewController({ animated: true });
    });

    // 4. Put it on the right side of this view controller's navigation bar
    page.navigationItem.rightBarButtonItems = [save];
    return page;
  }

  // Entry button in the middle of the home view controller
  const open = UIButton.buttonWithType('system');
  open.setTitle('Go to edit', { forState: ['normal'] });
  open.translatesAutoresizingMaskIntoConstraints = false;
  home.view.addSubview(open);
  NSLayoutConstraint.activateConstraints([
    open.centerXAnchor.constraintEqualToAnchor(home.view.centerXAnchor),
    open.centerYAnchor.constraintEqualToAnchor(home.view.centerYAnchor),
  ]);
  open.addEventListener('click', () => {
    nav.pushViewController(makeEditor(), { animated: true });
  });
});
```

**Effect**

- The home navigation bar shows "Home" in the middle, with no buttons on either side.
- Tapping "Go to edit" opens the edit view controller. The navigation bar shows "Edit" in the middle, a back button reading "Home" on the left, and a "Save" button on the right.
- Tapping "Save" prints `Saved` to the console, and the screen returns to the home view controller.

That the right-side navigation bar button displays and can be tapped is verified with real taps in the acceptance tests. How the `'prominent'` style looks is **not verified in the simulator**. This code has not been run as a whole in the simulator; every API it uses has been run in the acceptance tests.

The examples below reuse `nav` and `home` from here, and `page` is a view controller already in the navigation stack. To try one section on its own, start with these lines:

```js
const home = new UIViewController();
const nav = new UINavigationController(home);
const page = new UIViewController();
nav.pushViewController(page, { animated: false });
```

## Put a button on the right

```js
const done = new UIBarButtonItem({ title: 'Done' });
done.addEventListener('click', () => {
  console.log('Tapped Done');
});
page.navigationItem.rightBarButtonItems = [done];
```

**Effect**: "Done" appears on the right of the navigation bar. Each tap prints `Tapped Done` to the console once.

The event object the callback receives has only `type` and `target` (the button itself); see [`click`](../api/ui-bar-button-item/click-event.md).

## Use an icon as a button

```js
const share = new UIBarButtonItem({
  image: UIImage.systemImageNamed('square.and.arrow.up') ?? undefined,
});
page.navigationItem.rightBarButtonItems = [share];
```

**Effect**: A share icon appears on the right of the navigation bar. **The appearance is not verified in the simulator.**

`'square.and.arrow.up'` is a name from SF Symbols, the system's built-in icon library; see [`UIImage`](../api/ui-image.md). `systemImageNamed()` returns `null` when the name doesn't exist, so `?? undefined` here turns `null` into "not given".

## Use a system button

The system provides more than twenty common buttons; their text follows the system language and their icons are consistent across the system.

```js
const add = UIBarButtonItem.systemItem('add');
add.addEventListener('click', () => {
  console.log('New');
});
page.navigationItem.rightBarButtonItems = [add];
```

**Effect**: A plus sign appears on the right of the navigation bar. Tapping it prints `New` to the console. **The plus sign's appearance is not verified in the simulator.**

For all values, see [`UIBarButtonItem.systemItem()`](../api/ui-bar-button-item/systemitem.md).

## Put several buttons

```js
const edit = new UIBarButtonItem({ title: 'Edit' });
const more = UIBarButtonItem.systemItem('action');
page.navigationItem.rightBarButtonItems = [edit, more];
```

**Effect**: There are two buttons on the right of the navigation bar.

By iOS rules, the first item in `rightBarButtonItems` is rightmost and the rest go leftward in order; the first item in `leftBarButtonItems` is leftmost. **The ordering is not verified in the simulator.**

To leave more space between two buttons, insert a fixed-width space between them:

```js
page.navigationItem.rightBarButtonItems = [edit, UIBarButtonItem.fixedSpace(20), more];
```

**Effect**: There is an extra 20 pt of space between the two buttons. **Not verified in the simulator.**

## Remove buttons

```js
page.navigationItem.rightBarButtonItems = [];
```

**Effect**: All buttons on the right disappear.

Reading a button array gives a snapshot; `push`ing onto it or removing elements doesn't change the navigation bar. Assign the whole array.

## Disable a button

```js
const submit = new UIBarButtonItem({ title: 'Submit' });
page.navigationItem.rightBarButtonItems = [submit];

submit.isEnabled = false;
```

**Effect**: "Submit" turns gray and does nothing when tapped. Setting it back to `true` restores it. **"Turns gray" and "does nothing when tapped" are not verified in the simulator.**

Disabling the submit button while a form is incomplete is done with [`isEnabled`](../api/ui-bar-item/isenabled.md).

## Hide a button temporarily

Continuing with the "Submit" button from the previous section:

```js
const submit = new UIBarButtonItem({ title: 'Submit' });
page.navigationItem.rightBarButtonItems = [submit];

submit.isHidden = true;
```

**Effect**: The button disappears from the navigation bar but remains in `rightBarButtonItems`. Setting it back to `false` makes it reappear. **Not verified in the simulator.**

## Change the back button's text

The back button's text is determined by the **previous** view controller. To change the button that returns from `page` to `home`, set `home`'s [`backButtonTitle`](../api/ui-navigation-item/backbuttontitle.md):

```js
home.navigationItem.backButtonTitle = 'Back';
```

**Effect**: On the next view controller opened from home, the back button reads "Back" instead of "Home". **The button text is not verified in the simulator.**

The title in the home view controller's own navigation bar is unaffected; it is still "Home".

## Hide the back button

```js
page.navigationItem.hidesBackButton = true;
```

**Effect**: While `page` is at the top of the stack, there is no back button on the left of the navigation bar. **Not verified in the simulator.**

> **Note:** By iOS rules, hiding the back button also disables swipe-to-go-back. The view controller then needs some other way back, such as a button that calls `nav.popViewController()`; otherwise the user cannot leave it.

## Add a subtitle

```js
page.navigationItem.subtitle = '12 items';
```

**Effect**: A line of small text, "12 items", appears below the title in the navigation bar. Write `null` to remove it. **The appearance is not verified in the simulator.**

## Use your own view as the title

```js
const logo = new UILabel();
logo.text = 'Nacre';
logo.font = UIFont.systemFontOfSize(20, { weight: 'bold' });
page.navigationItem.titleView = logo;
```

**Effect**: The middle of the navigation bar shows this [`UILabel`](../api/ui-label.md) instead of the `title` text. Write `null` to show `title` again. **The appearance is not verified in the simulator.**

`page.title` is still useful here: the next view controller's back button still shows it.

## Put your own view in the navigation bar

```js
const badge = new UILabel();
badge.text = 'Draft';
badge.textColor = 'systemOrange';

const draft = new UIBarButtonItem({ customView: badge });
page.navigationItem.rightBarButtonItems = [draft];
```

**Effect**: An orange "Draft" appears on the right of the navigation bar. **The appearance is not verified in the simulator.**

For a button that uses [`customView`](../api/ui-bar-button-item/customview.md), what is drawn is determined entirely by that view; `title`, `image`, and `style` no longer have any effect. Whether tapping it fires `click` is **not verified in the simulator**; to respond to taps, use a [`UIButton`](../api/ui-button.md) as the `customView` and listen on that button.

## Left buttons and going back

The left side of the navigation bar is normally where the back button goes. Once a view controller sets [`leftBarButtonItems`](../api/ui-navigation-item/leftbarbuttonitems.md) or `hidesBackButton`, the back button is not shown and swipe-to-go-back stops working (**not verified in the simulator**); see [Left buttons and going back](../api/ui-navigation-item.md#left-buttons-and-going-back). You then need to provide your own way back:

```js
const back = new UIBarButtonItem({ title: 'Cancel' });
back.addEventListener('click', () => {
  nav.popViewController({ animated: true });
});
page.navigationItem.leftBarButtonItems = [back];
```

**Effect**: The left of the navigation bar shows "Cancel", with no system back button. Tapping "Cancel" returns to the previous view controller. **Not verified in the simulator.**

## See also

- [`UINavigationItem`](../api/ui-navigation-item.md): a view controller's configuration in the navigation bar
- [`UIBarButtonItem`](../api/ui-bar-button-item.md): buttons in the navigation bar
- [`UIBarItem`](../api/ui-bar-item.md): the buttons' parent class
- [`UINavigationController`](../api/ui-navigation-controller.md): displays the navigation bar; push, pop, swipe to go back
