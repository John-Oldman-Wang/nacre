---
type: reference
native: "+[UIFont preferredFontForTextStyle:]"
---

# `UIFont.preferredFontForTextStyle()` static method

The **`UIFont.preferredFontForTextStyle()`** static method returns a system font for a purpose (body, heading, footnote, and so on). The size depends on the level the user chose in the system's "Settings → Display & Brightness → Text Size".

## Syntax

```
UIFont.preferredFontForTextStyle(style)
```

### Parameters

**`style`**

A [text style](../ui-font.md#text-styles) name, one of these eleven: `'largeTitle'`, `'title1'`, `'title2'`, `'title3'`, `'headline'`, `'subheadline'`, `'body'`, `'callout'`, `'footnote'`, `'caption1'`, `'caption2'`.

### Return value

A `UIFont`; never `null`. The size is the one under the text size setting at the moment of the call.

The returned font object is immutable. If the user changes the setting later, this object's `pointSize` does not change, and neither do labels already using it. To follow changes, call it again and assign the result in the `contentsizecategorychange` event of `application`; see [Dynamic Type](../ui-font.md#dynamic-type).

### Exceptions

**`TypeError`**

`style` is not one of the eleven names:

```
TypeError: textStyle has no value "subtitle"; expected one of: largeTitle / title1 / title2 / title3 / headline / subheadline / body / callout / footnote / caption1 / caption2
```

## Examples

### Using the body style

```js
const label = new UILabel();
label.font = UIFont.preferredFontForTextStyle('body');
console.log(label.font.pointSize);
```

**Effect**

- The text is shown in the "body" style.
- The console logs the body size under the current setting. If the user makes text larger and relaunches the app, the logged number gets larger. **"Larger after increasing the setting" is not verified in the simulator.**

### Updating the font after the user changes the setting

```js
const label = new UILabel();
label.font = UIFont.preferredFontForTextStyle('body');
application.addEventListener('contentsizecategorychange', () => {
  label.font = UIFont.preferredFontForTextStyle('body');
});
```

**Effect**: while the app is running, if the user changes the text size in system settings, the text switches to the new size on returning to the app. **Not verified in the simulator.**

## Corresponding iOS API

`+[UIFont preferredFontForTextStyle:]`. `UIFontTextStyleBody` is written `'body'`, and likewise for the others.

## See also

- [Dynamic Type](../ui-font.md#dynamic-type)
- [Setting fonts](../../guides/fonts.md)
- [`application`](../application.md): `contentSizeCategory` and the `contentsizecategorychange` event
