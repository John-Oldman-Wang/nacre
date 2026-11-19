---
type: reference
native: "-[UIBarButtonItem initWithTitle:style:target:action:]"
---

# `UIBarButtonItem()` constructor

The **`UIBarButtonItem()`** constructor creates a navigation bar button.

## Syntax

```
new UIBarButtonItem()
new UIBarButtonItem({ title, image, style, isEnabled, customView })
```

### Parameters

The parameter is an object, and every member is optional. Without a parameter you get a button with no text and no icon.

**`options.title`**

The text on the button, a string. See [`title`](../ui-bar-item/title.md).

**`options.image`**

The icon on the button, a [`UIImage`](../ui-image.md). See [`image`](../ui-bar-item/image.md).

**`options.style`**

The style: `'plain'`, `'prominent'`, or `'done'`. See [`style`](style.md). Defaults to `'plain'`.

**`options.isEnabled`**

A boolean: whether it can be tapped. See [`isEnabled`](../ui-bar-item/isenabled.md). Defaults to `true`.

**`options.customView`**

A [`UIView`](../ui-view.md) to use in place of the system-drawn button. See [`customView`](customview.md).

Giving `title`, `image`, `style`, or `isEnabled` in the parameter has the same effect as writing the property of the same name after creation.

### Return value

A new `UIBarButtonItem`.

### Exceptions

Invalid members in the parameter produce the same errors as writing the corresponding property; see each property's page.

## Examples

```js
const plain = new UIBarButtonItem();
const save = new UIBarButtonItem({ title: 'Save', style: 'prominent' });
console.log(plain.title, save.title, save.style);
```

**Result**: the console prints `null Save prominent`.

## Corresponding iOS API

`-[UIBarButtonItem initWithTitle:style:target:action:]`, `initWithImage:style:target:action:`, and `initWithCustomView:`. The three initializers are merged into one options object; `target` and `action` are replaced by the [`click`](click-event.md) event.

## See also

- [`UIBarButtonItem.systemItem()`](systemitem.md): creating system-provided buttons
- [`click`](click-event.md)
