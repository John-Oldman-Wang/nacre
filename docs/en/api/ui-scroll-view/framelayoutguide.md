---
type: reference
native: UIScrollView.frameLayoutGuide
---

# `UIScrollView`: `frameLayoutGuide` property

The **`frameLayoutGuide`** property is a reference used only for writing constraints, representing the visible area.

## Value

A [`UILayoutGuide`](../ui-layout-guide.md).

- Read-only. Assigning to it throws `TypeError`.
- Aligning a subview with it means "this subview has the same size as the visible area". When the container's width equals its width, the content area is as wide as the visible area and cannot scroll horizontally.
- When you use this approach, do not also write `contentSize`.

## Examples

```js
const scroller = new UIScrollView();
const column = new UIStackView();
column.translatesAutoresizingMaskIntoConstraints = false;
column.axis = 'vertical';
scroller.addSubview(column);

const content = scroller.contentLayoutGuide;
const frame = scroller.frameLayoutGuide;
NSLayoutConstraint.activateConstraints([
  column.topAnchor.constraintEqualToAnchor(content.topAnchor),
  column.bottomAnchor.constraintEqualToAnchor(content.bottomAnchor),
  column.leadingAnchor.constraintEqualToAnchor(content.leadingAnchor),
  column.trailingAnchor.constraintEqualToAnchor(content.trailingAnchor),
  column.widthAnchor.constraintEqualToAnchor(frame.widthAnchor),
]);
```

**Effect**: the content area is as large as `column` and as wide as the visible area, so it scrolls only up and down. These five constraints have been run in the acceptance tests.

## Corresponding iOS API

`UIScrollView.frameLayoutGuide`.

## See also

- [Content area size](../ui-scroll-view.md#content-area-size)
- [`UILayoutGuide`](../ui-layout-guide.md)
