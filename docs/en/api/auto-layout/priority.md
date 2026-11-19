---
type: reference
native: NSLayoutConstraint.priority
---

# `NSLayoutConstraint`: `priority` property

The **`priority`** property is the constraint's priority: when constraints contradict each other, the system satisfies the higher-priority ones first.

## Value

Written as a number or a priority name; always reads back as a number. Numbers range from 1 to 1000 and have no unit.

- Readable and writable.
- Defaults to `1000` (`'required'`, must be satisfied). This default comes from UIKit's definition and is **not verified in the simulator**.
- Below 1000 means "satisfy if possible": the system first satisfies all constraints at 1000, then tries to satisfy the rest from highest to lowest priority. One it can't satisfy doesn't count as a conflict.
- What happens when you write a number outside 1 to 1000 is **not verified in the simulator**. Don't do it.
- There's no change notification. Only the app's own code changes it.

The seven names:

| Name | Value | Meaning |
| --- | --- | --- |
| `'required'` | 1000 | Must be satisfied |
| `'defaultHigh'` | 750 | The default priority with which a view resists being squeezed |
| `'dragThatCanResizeScene'` | 510 | Used by the system; not needed in everyday code |
| `'sceneSizeStayPut'` | 500 | Used by the system; not needed in everyday code |
| `'dragThatCannotResizeScene'` | 490 | Used by the system; not needed in everyday code |
| `'defaultLow'` | 250 | The default priority with which a view resists being stretched |
| `'fittingSizeLevel'` | 50 | The priority `systemLayoutSizeFittingSize()` uses when finding the smallest size |

### Invalid values

A misspelled name doesn't throw. The console prints a warning, `[Nacre] priority has no value "veryImportant"; expected one of: … , or a number between 0 and 1000, ignored`, where the ellipsis stands for the seven names, and `priority` keeps its previous value.

## Examples

```js
const parent = new UIView();
const box = new UIView();
box.translatesAutoresizingMaskIntoConstraints = false;
parent.addSubview(box);

const c = box.heightAnchor.constraintEqualToConstant(60);
c.priority = 'defaultHigh';
console.log(c.priority);
c.priority = 749;
console.log(c.priority);
```

**Result**: Prints `750`, then `749`. A value such as 749 has no name, so priorities always read back as numbers.

## Corresponding iOS API

`NSLayoutConstraint.priority`. `UILayoutPriorityDefaultLow` becomes `'defaultLow'`, and so on for the rest.

## See also

- [Priority](../auto-layout.md#priority)
- [Limiting minimum and maximum size](../../guides/auto-layout.md#limiting-minimum-and-maximum-size)
