---
type: reference
native: "-[UIScreenEdgePanGestureRecognizer init]"
---

# `UIScreenEdgePanGestureRecognizer()` constructor

The **`UIScreenEdgePanGestureRecognizer()`** constructor creates a screen-edge pan gesture recognizer. A new recognizer's `edges` is an empty array; until `edges` is set, no gesture is recognized.

## Syntax

```
new UIScreenEdgePanGestureRecognizer()
```

### Parameters

None.

### Return value

A new `UIScreenEdgePanGestureRecognizer`. Three defaults differ from [`UIPanGestureRecognizer`](../ui-pan-gesture-recognizer.md): [`edges`](edges.md) is `[]`, `maximumNumberOfTouches` is 1, and `delaysTouchesBegan` is `true`.

### Exceptions

**`TypeError`**

Subclassing with `class X extends UIScreenEdgePanGestureRecognizer {}` and then calling `new X()` throws `TypeError`. No native class can be subclassed; see [Native classes](../native-classes.md).

## Examples

```js
const page = new UIView();
const fromRight = new UIScreenEdgePanGestureRecognizer();
fromRight.edges = ['right'];
fromRight.addEventListener('began', () => {
  console.log('Dragged in from the right edge');
});
page.addGestureRecognizer(fromRight);
```

**Effect**: when `page` fills the screen, dragging a finger left from the right edge of the screen logs `Dragged in from the right edge`. A drag that starts in the middle of the screen logs nothing. **Not verified in the simulator.**

## Corresponding iOS API

`[[UIScreenEdgePanGestureRecognizer alloc] init]`. Natively, `initWithTarget:action:` registers the callback at the same time; here you create the recognizer first, then listen with [`addEventListener()`](../ui-gesture-recognizer/addeventlistener.md).

## See also

- [`edges`](edges.md)
