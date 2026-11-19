---
type: reference
native: UIBarButtonItem.customView
---

# `UIBarButtonItem`: `customView` property

The **`customView`** property is a view displayed on the navigation bar in place of the system-drawn button.

## Value

A [`UIView`](../ui-view.md), or `null`.

- Readable and writable.
- Defaults to `null`, meaning the system draws the button.
- Once a view is set, what's drawn is determined entirely by that view; [`title`](../ui-bar-item/title.md), [`image`](../ui-bar-item/image.md), and [`style`](style.md) no longer have any effect.
- Whether [`click`](click-event.md) fires when the user taps it is **not verified in the simulator**. To respond to taps, use a [`UIButton`](../ui-button.md) as the `customView` and listen on that button.
- No event fires when it changes: it only changes through code.

### Invalid values

Writing something that isn't a view throws `TypeError: customView needs a UIView or null`.

## Examples

```js
const page = new UIViewController();
const badge = new UILabel();
badge.text = 'Draft';
badge.textColor = 'systemOrange';

const item = new UIBarButtonItem({ customView: badge });
page.navigationItem.rightBarButtonItems = [item];
console.log(item.customView === badge);
```

**Result**: the console prints `true`. When the view controller is at the top of the navigation stack, an orange "Draft" appears on the right of the navigation bar; **the appearance is not verified in the simulator**.

## Corresponding iOS API

`UIBarButtonItem.customView`, and `-[UIBarButtonItem initWithCustomView:]` (written here as the constructor option `{ customView }`).

## See also

- [`UIBarButtonItem()`](constructor.md)
- [`titleView`](../ui-navigation-item/titleview.md): putting your own view in the center of the navigation bar
