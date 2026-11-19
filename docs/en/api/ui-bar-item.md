---
type: reference
native: UIBarItem
status: partial
---

# `UIBarItem`

**`UIBarItem`** represents the shared part of an item on a navigation bar or tab bar: text, icon, whether it can be tapped, and a tag number. It is the common superclass of [`UIBarButtonItem`](ui-bar-button-item.md) (a button on the navigation bar) and [`UITabBarItem`](ui-tab-bar-item.md) (a tab on the tab bar), and cannot be created itself.

**Inheritance**: `EventTarget` → `NSObject` → `UIBarItem`

```
EventTarget
  └─ NSObject
       └─ UIBarItem
            ├─ UIBarButtonItem
            └─ UITabBarItem
```

## Constructor

Cannot be created with `new`. `new UIBarItem()` throws `TypeError: Illegal constructor: UIBarItem is abstract; construct UIBarButtonItem instead`. Create its subclass [`UIBarButtonItem`](ui-bar-button-item.md); a [`UITabBarItem`](ui-tab-bar-item.md) comes with each view controller.

## Instance properties

| Property | Description |
| --- | --- |
| [`title`](ui-bar-item/title.md) | The text |
| [`image`](ui-bar-item/image.md) | The icon |
| [`isEnabled`](ui-bar-item/isenabled.md) | Whether it can be tapped |
| [`tag`](ui-bar-item/tag.md) | A number for your own use; the system ignores it |

None of these four properties fires an event when it changes: only code changes them.

## Examples

```js
const item = new UIBarButtonItem({ title: 'Submit' });
item.isEnabled = false;
item.tag = 7;
console.log(item instanceof UIBarItem, item.title, item.isEnabled, item.tag);
```

**Result**: The console prints `true Submit false 7`.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `item.title = @"Submit"` | `item.title = 'Submit'` |
| `item.image = img` | `item.image = img` |
| `item.enabled = NO` | `item.isEnabled = false` |
| `item.tag = 7` | `item.tag = 7` |

## See also

- [`UIBarButtonItem`](ui-bar-button-item.md): buttons on the navigation bar
- [`UITabBarItem`](ui-tab-bar-item.md): tabs on the tab bar
