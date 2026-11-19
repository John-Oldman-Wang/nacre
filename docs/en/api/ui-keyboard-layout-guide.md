---
type: reference
native: UIKeyboardLayoutGuide
---

# `UIKeyboardLayoutGuide`

**`UIKeyboardLayoutGuide`** represents a layout guide for the area the keyboard occupies. Every view has one, read from [`view.keyboardLayoutGuide`](ui-view/keyboardlayoutguide.md).

When the keyboard is hidden, its top edge is at the bottom edge of the safe area; when the keyboard is shown, its top edge is at the top edge of the keyboard. Constrain the bottom edge of your content to its `topAnchor`, and a single constraint covers both cases, with no need to listen for keyboard events or calculate the keyboard's height.

**Inheritance**: `EventTarget` → `NSObject` → [`UILayoutGuide`](ui-layout-guide.md) → `UITrackingLayoutGuide` → `UIKeyboardLayoutGuide`

`UITrackingLayoutGuide` has no members of its own. For how to use the keyboard together with text fields, see [Text fields and the keyboard](ui-text-field.md).

## Constructor

Can't be created with `new`. Read it from a view's [`keyboardLayoutGuide`](ui-view/keyboardlayoutguide.md).

## Instance properties

Also inherits properties from [`UILayoutGuide`](ui-layout-guide.md): the anchors, `layoutFrame`, `owningView`, and `identifier`.

| Property | Description |
| --- | --- |
| [`followsUndockedKeyboard`](ui-keyboard-layout-guide/followsundockedkeyboard.md) | Whether it still follows the keyboard when the keyboard leaves the bottom of the screen. Relevant only to the floating and split keyboards on iPad |
| [`keyboardDismissPadding`](ui-keyboard-layout-guide/keyboarddismisspadding.md) | When the user drags to dismiss the keyboard, how far the finger is from the keyboard's top edge when dismissal begins, in pt |

Reading, writing, and the default values of both properties are asserted in the acceptance tests. Their actual effect on the UI is **not verified in the simulator**.

## Events

Doesn't fire events. If you calculate positions yourself and need to know when the keyboard appears and is dismissed, listen for [`keyboardshow`](ui-screen/keyboardshow-event.md), [`keyboardhide`](ui-screen/keyboardhide-event.md), and [`keyboardchange`](ui-screen/keyboardchange-event.md) on the screen.

## Examples

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const bar = new UIView();
  bar.backgroundColor = 'systemGreen';
  bar.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(bar);

  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    bar.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
    bar.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
    bar.heightAnchor.constraintEqualToConstant(44),
    bar.bottomAnchor.constraintEqualToAnchor(
      page.view.keyboardLayoutGuide.topAnchor, { constant: -16 }),
  ]);
});
```

**Effect**

- With no keyboard, `bar` is 16 pt above the bottom edge of the safe area. This is asserted in the acceptance tests.
- When a text field on the page gets focus and the keyboard appears, `bar` moves up with the keyboard and stops 16 pt above it. When the keyboard is dismissed, it returns to its original position. Its position while the keyboard is shown is **not verified in the simulator**.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `view.keyboardLayoutGuide.topAnchor` | `view.keyboardLayoutGuide.topAnchor` |
| `guide.followsUndockedKeyboard = YES` | `guide.followsUndockedKeyboard = true` |

## See also

- [`UILayoutGuide`](ui-layout-guide.md)
- [Text fields and the keyboard](ui-text-field.md)
- [Following the keyboard](../guides/auto-layout.md#following-the-keyboard)
