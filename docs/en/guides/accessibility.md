# Making VoiceOver read your interface correctly

This guide covers how to use the accessibility properties on [`UIView`](../api/ui-view.md) so that VoiceOver reads your interface correctly: when to make a view an accessibility element, what goes in the label, hint, and value, how to choose traits, how to merge several subviews of a control you build yourself into one element, and how to keep VoiceOver inside an overlay.

VoiceOver is the screen reader built into iOS, used by people who can't see the screen well. While it is on, the user swipes left or right on the screen and VoiceOver stops on one **element** after another in order, reading each one out; double-tapping the screen taps the element it is currently on. What is read out for an element is decided by four properties: [`accessibilityLabel`](../api/ui-view/accessibilitylabel.md) (the name), [`accessibilityValue`](../api/ui-view/accessibilityvalue.md) (the value), [`accessibilityTraits`](../api/ui-view/accessibilitytraits.md) (the traits), and [`accessibilityHint`](../api/ui-view/accessibilityhint.md) (the hint).

In this guide, what VoiceOver reads and how it reads it come from Apple's documentation; none of it has been listened to with VoiceOver on, so it is **not verified on a device**. Reading and writing the properties, their defaults, and how invalid values are handled are verified on a device.

## Recommended approach

- **System controls that show text need nothing.** A `UILabel`'s name comes from the text it shows, and a `UIButton` comes with the button trait (measured).
- **A button with only an icon and no text must have an `accessibilityLabel`.** Otherwise VoiceOver has nothing to read.
- **For something you assemble from `UIView`s that should read as one thing (a card, a list row, a control you build yourself), set `isAccessibilityElement = true`**, then give it a name and traits.
- **The name says what it is, the value says what it is now, and the hint says what operating it does.** Don't put a type such as "button" in the name; the traits read the type.
- **When the state changes, change the traits or the value at the same time.** Add `'selected'` when it becomes selected, and write a new `accessibilityValue` when the number changes. They don't follow the interface by themselves.
- **For an overlay you build out of views yourself, set `accessibilityViewIsModal = true`**, and add it directly to the page's root view.
- **When you're done, go through it on a device with VoiceOver on**; see [Listening with VoiceOver on](#listening-with-voiceover-on).

## First example

Starting from a blank app, build an account page: a heading, a balance card, and a refresh button with only an icon.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Heading: marked as a heading so VoiceOver users can jump here by heading
  const heading = new UILabel();
  heading.text = 'My account';
  heading.font = UIFont.boldSystemFontOfSize(28);
  heading.accessibilityTraits = ['header'];

  // 2. Balance card: two lines of text merged into one element; the name is "Balance", the value is the amount
  const caption = new UILabel();
  caption.text = 'Balance';
  caption.textColor = 'secondaryLabel';
  const amount = new UILabel();
  amount.text = '$1,280.00';
  amount.font = UIFont.boldSystemFontOfSize(22);
  const card = new UIStackView([caption, amount]);
  card.axis = 'vertical';
  card.spacing = 4;
  card.isAccessibilityElement = true;
  card.accessibilityLabel = 'Balance';
  card.accessibilityValue = amount.text;

  // 3. A button with only an icon: give it a name and a hint
  const refresh = UIButton.buttonWithType('system');
  refresh.setImage(UIImage.systemImageNamed('arrow.clockwise'), { forState: ['normal'] });
  refresh.accessibilityLabel = 'Refresh balance';
  refresh.accessibilityHint = 'Fetches the account balance again';
  refresh.addEventListener('click', () => {
    console.log('Refresh');
  });

  // 4. Arrange them in a column, top to bottom
  const column = new UIStackView([heading, card, refresh]);
  column.axis = 'vertical';
  column.spacing = 16;
  column.alignment = 'leading';
  column.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(column);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  ]);
});
```

**Effect**

- At the top left of the screen, from top to bottom: "My account" in large type, "Balance" in gray, "$1,280.00" in bold, and a refresh icon.
- Tapping the refresh icon prints `Refresh` to the console.
- Swiping from top to bottom with VoiceOver on, VoiceOver stops on three elements in turn: it reads "My account" and says it is a heading; it reads "Balance, $1,280.00" without stopping on the two lines separately; it reads "Refresh balance" and says it is a button, then after a short pause reads "Fetches the account balance again". **The VoiceOver part is not verified on a device.**

The following sections reuse the variable `page`. To try a section on its own, write this line first:

```js
const page = new UIViewController();
```

## Deciding which views VoiceOver stops on

Whether VoiceOver stops on a view is decided by [`isAccessibilityElement`](../api/ui-view/isaccessibilityelement.md):

- **On `UIView` it is `false` by default.** VoiceOver doesn't stop on the view; it goes through it to look at its subviews. So a container that only holds other views needs nothing set.
- **System controls are decided by the system.** Controls such as `UILabel` and `UIButton` need nothing set. When they aren't in a window they read `false` (measured); what they read once placed in a window is **not verified on a device**.
- **Once it is `true`, VoiceOver treats the view as a whole and no longer stops on its subviews.** Any important text in the subviews has to go into this view's name or value, or VoiceOver users won't hear it.

So set `true` only on views that are one thing in the user's eyes, such as a card or a list row. Don't set it on a container that holds other buttons meant to be operated separately: once set, VoiceOver can't reach those buttons.

```js
const row = new UIView();
const name = new UILabel();
name.text = 'Alex';
const status = new UILabel();
status.text = 'Online';
row.addSubview(name);
row.addSubview(status);

row.isAccessibilityElement = true;
row.accessibilityLabel = 'Alex, Online';
```

**Effect**: VoiceOver stops on the whole row and reads "Alex, Online" in one go, instead of stopping on the two labels separately. **Not verified on a device.**

## What goes in the label, hint, and value

| Property | What goes in it | Examples |
| --- | --- | --- |
| [`accessibilityLabel`](../api/ui-view/accessibilitylabel.md) | What it is. A few words, not a sentence | "Refresh balance", "Order 1024" |
| [`accessibilityValue`](../api/ui-view/accessibilityvalue.md) | Its current number or state, the part that changes | "$1,280.00", "50%", "3 items" |
| [`accessibilityHint`](../api/ui-view/accessibilityhint.md) | What operating it does. Leave it out when the name already makes that clear | "Opens the order details" |

VoiceOver reads the name first, then the value and traits, and after a short pause the hint (from Apple's documentation, **not verified on a device**). A few things to keep in mind when writing them:

- **Don't put the type in the name.** "Button", "link", and "heading" are read from the [traits](#choosing-traits); putting them in the name makes VoiceOver say them twice.
- **Don't put things that change in the name.** Amounts, progress, and counts go in the value; the name stays the same.
- **Don't put essential information in the hint.** Users can turn hints off in the system settings, and then hints aren't read.
- **When the app supports several languages, write these three per language too.** They are text read to the user, just like the text on screen.
- When a `UILabel` has no name set, VoiceOver reads the text it shows (measured: with VoiceOver on, `accessibilityLabel` reads the label's text). Set one only when what should be read differs from what is shown.

The value doesn't follow the interface by itself. When the number on screen changes, write the value at the same time:

```js
const amount = new UILabel();
const card = new UIView();
card.isAccessibilityElement = true;
card.accessibilityLabel = 'Balance';

/** @param {string} text */
function showBalance(text) {
  amount.text = text;
  card.accessibilityValue = text;
}
showBalance('$1,320.00');
console.log(card.accessibilityValue);
```

**Effect**: The console prints `$1,320.00`. The next time VoiceOver stops on the card it reads the new amount. **The VoiceOver part is not verified on a device.**

## Choosing traits

[Traits](../api/ui-view/accessibilitytraits.md) tell VoiceOver what kind of thing an element is and what state it is in. VoiceOver uses them to add a note such as "button" or "heading" after the name, and VoiceOver users can jump by trait, for example from heading to heading.

| What it is in the interface | Traits |
| --- | --- |
| A view you built that can be tapped | `['button']` |
| Tapping it opens a URL or another page | `['link']` |
| The heading of a section of content | `['header']` |
| A meaningful image | `['image']`, with a name saying what the image shows |
| A group of tabs that switch pages | `['tabBar']` |
| The selected item | Add `'selected'` to the existing traits |
| Temporarily unavailable | Add `'notEnabled'` to the existing traits |

- System controls come with traits: a `UIButton`'s traits include `'button'`, and a `UILabel`'s include `'staticText'` (measured).
- The array you write **replaces all** the existing traits. To add one to the existing traits, read them first and combine: `[...view.accessibilityTraits, 'selected']`.
- The order you read back is not the order you wrote. Use `includes()` to check for a trait.
- If even one name in the array is misspelled, the whole assignment has no effect, and the console prints a warning listing all the valid names (measured).

When the selection changes, change the traits with it:

```js
const tab = new UIView();
tab.isAccessibilityElement = true;
tab.accessibilityLabel = 'All orders';

/** @param {boolean} selected */
function setSelected(selected) {
  tab.accessibilityTraits = selected ? ['button', 'selected'] : ['button'];
}
setSelected(true);
console.log(tab.accessibilityTraits.includes('selected'));
```

**Effect**: The console prints `true`. When VoiceOver stops here it reads "All orders" and says it is selected and is a button. **The VoiceOver part is not verified on a device.**

## A control you build yourself: merging several subviews into one element

A checkbox you assemble yourself: a square icon on the left, a line of text on the right, and tapping the whole row toggles the check. To a VoiceOver user it is one thing that can be tapped and has a selected state, so make the whole row one element, take the name from the text, give it the button trait, and add `'selected'` when it is checked.

```js
const box = new UIImageView();
box.image = UIImage.systemImageNamed('square');
const text = new UILabel();
text.text = 'Remember me';
const row = new UIStackView([box, text]);
row.spacing = 8;

row.isAccessibilityElement = true;
row.accessibilityLabel = text.text;
row.accessibilityTraits = ['button'];

let checked = false;
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', () => {
  checked = !checked;
  box.image = UIImage.systemImageNamed(checked ? 'checkmark.square.fill' : 'square');
  row.accessibilityTraits = checked ? ['button', 'selected'] : ['button'];
});
row.addGestureRecognizer(tap);
page.view.addSubview(row);
```

**Effect**

- Tapping the row with a finger toggles the box between empty and checked.
- VoiceOver stops on the whole row, reads "Remember me", and says it is a button; once checked, stopping here again also says it is selected.
- With VoiceOver on, double-tapping the screen is the same as tapping the center of the row, so the check still toggles.

**The VoiceOver part is not verified on a device.**

## Overlays: keeping VoiceOver inside

When an overlay you build out of views covers the page, sighted users can see the content underneath is blocked, but VoiceOver still stops on the buttons underneath. Set [`accessibilityViewIsModal`](../api/ui-view/accessibilityviewismodal.md) on the overlay, and VoiceOver stays inside it.

```js
const message = new UILabel();
message.text = 'Sign out of this account?';
const confirm = UIButton.buttonWithType('system');
confirm.setTitle('Sign out', { forState: ['normal'] });

const sheet = new UIStackView([message, confirm]);
sheet.axis = 'vertical';
sheet.spacing = 12;
sheet.backgroundColor = 'secondarySystemBackground';
sheet.frame = new CGRect(24, 200, 320, 140);
sheet.accessibilityViewIsModal = true;
page.view.addSubview(sheet);   // Added directly to the page's root view

confirm.addEventListener('click', () => {
  sheet.removeFromSuperview();
});
```

**Effect**

- A gray overlay appears on the page, with a line of text and a "Sign out" button.
- VoiceOver moves only between the two elements "Sign out of this account?" and "Sign out", and skips all the content on the page that the overlay covers.
- Tapping "Sign out" removes the overlay, and VoiceOver can stop on the page's content again.

**The VoiceOver part is not verified on a device.**

> **Note:** VoiceOver skips only the overlay's siblings, that is, the views that share its superview (from Apple's documentation). Add the overlay directly to the superview of the content it covers, usually the page's root view `page.view`. If you wrap it in another container and add that, VoiceOver still stops on the content outside the container.

## Skipping purely decorative content

Views such as background patterns and decorative dividers mean nothing to VoiceOver users. Set [`accessibilityElementsHidden`](../api/ui-view/accessibilityelementshidden.md) on the view that holds them, and VoiceOver skips all the elements inside:

```js
const decoration = new UIView();
decoration.addSubview(new UIImageView());
decoration.accessibilityElementsHidden = true;
page.view.addSubview(decoration);
```

**Effect**: The pattern shows as usual, and VoiceOver doesn't stop on it. **The VoiceOver part is not verified on a device.**

## Reading two columns one column at a time

By default VoiceOver orders elements by position: top to bottom, and left to right within a row. With two columns side by side, it alternates between left and right. Set [`shouldGroupAccessibilityChildren`](../api/ui-view/shouldgroupaccessibilitychildren.md) on each column, and VoiceOver finishes one column before reading the other:

```js
const left = new UIStackView();
left.axis = 'vertical';
const right = new UIStackView();
right.axis = 'vertical';
left.shouldGroupAccessibilityChildren = true;
right.shouldGroupAccessibilityChildren = true;
const columns = new UIStackView([left, right]);
page.view.addSubview(columns);
```

**Effect**: VoiceOver reads all the elements in `left`, then the ones in `right`. **The VoiceOver part is not verified on a device.**

## Leaving identifiers for automated UI tests

Automated UI tests (such as XCUITest, which comes with Xcode) need a name to find a button and tap it. Don't let them find it by `accessibilityLabel`: names get translated and reworded. Give it a separate [`accessibilityIdentifier`](../api/ui-view/accessibilityidentifier.md), which VoiceOver doesn't read:

```js
const submit = UIButton.buttonWithType('system');
submit.setTitle('Place order', { forState: ['normal'] });
submit.accessibilityIdentifier = 'checkout-submit';
```

**Effect**: VoiceOver reads "Place order" as usual. Test code finds this button by `checkout-submit`, no matter how the button's title changes.

## Listening with VoiceOver on

The effects in this guide can only be heard on a device with VoiceOver on:

1. Open Settings → Accessibility → VoiceOver and turn VoiceOver on.
2. In Settings → Accessibility → Accessibility Shortcut, choose VoiceOver. After that, triple-clicking the side button turns VoiceOver on and off.
3. With VoiceOver on: swipe left or right to move to the previous or next element; double-tap the screen to tap the current element; touch something on the screen with one finger and VoiceOver moves there.

With VoiceOver on, an ordinary tap no longer taps directly; turn VoiceOver off before operating the app as usual.

## See also

- [`UIView`](../api/ui-view.md): all the accessibility properties
- [`UIButton`](../api/ui-button.md), [`UILabel`](../api/ui-label.md): system controls that come with names and traits
- [Responding to gestures](gestures.md): making views you assemble respond to taps
- [Showing alerts and menus](alerts.md): the system's alerts
