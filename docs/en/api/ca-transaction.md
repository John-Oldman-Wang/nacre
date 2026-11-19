---
type: reference
native: CATransaction
status: partial
---

# `CATransaction`

**`CATransaction`** represents a transaction: a group of layer changes handed to the system together. It controls the implicit animations of those changes: turning them off, or changing their duration and timing curve.

`CATransaction` has no instances; everything is a static method. `begin()` and `commit()` come in pairs, and settings made between them apply only to the changes in between; after `commit()`, things return to how they were.

**Inheritance**: `CATransaction`. It doesn't inherit from `NSObject` and isn't an `EventTarget`.

For when to turn off implicit animations and when to create your own animation objects, see the guide [Turning off implicit animations](../guides/animation.md#turning-off-implicit-animation).

## Constructor

Can't be created with `new`. `new CATransaction()` throws `TypeError: Illegal constructor: CATransaction is a set of class methods, not an object`.

## Static methods

Starting and ending a transaction:

| Method | Description |
| --- | --- |
| [`CATransaction.begin()`](ca-transaction/begin.md) | Starts a transaction |
| [`CATransaction.commit()`](ca-transaction/commit.md) | Ends the most recently started transaction |
| [`CATransaction.flush()`](ca-transaction/flush.md) | Hands the layer changes made so far to the system immediately |

Settings of the current transaction, each with a getter and a setter:

| Method | Description |
| --- | --- |
| [`CATransaction.disableActions()`](ca-transaction/disableactions.md) | Whether the current transaction has implicit animations turned off |
| [`CATransaction.setDisableActions()`](ca-transaction/setdisableactions.md) | Turns implicit animations off or on for the current transaction |
| [`CATransaction.animationDuration()`](ca-transaction/animationduration.md) | The implicit animation duration of the current transaction |
| [`CATransaction.setAnimationDuration()`](ca-transaction/setanimationduration.md) | Sets the implicit animation duration of the current transaction |
| [`CATransaction.animationTimingFunction()`](ca-transaction/animationtimingfunction.md) | The timing curve used by the current transaction's implicit animations |
| [`CATransaction.setAnimationTimingFunction()`](ca-transaction/setanimationtimingfunction.md) | Sets the timing curve used by the current transaction's implicit animations |

## Implicit animations

Once a layer created with `new` has been shown on screen, changing its properties doesn't jump straight to the new value. The system automatically adds a transition animation; this is called an implicit animation. The duration is the iOS default of 0.25 seconds (**the duration is not verified in the simulator**).

```js
const shape = new CAShapeLayer();
// ...shape is already shown on screen
shape.strokeEnd = 0.5;
console.log(shape.animationKeys());
```

**Result**: after the layer has been shown, the logged array contains `'strokeEnd'`: this assignment made the system add an animation to the layer, named after the property.

Whether an implicit animation occurs, as measured:

| When the property changes | Implicit animation? |
| --- | --- |
| The layer hasn't been added to a parent layer yet | No |
| The layer has been added but not shown yet | No |
| The layer has been shown | Yes |
| A view's own layer (`view.layer`) | No. **Not verified in the simulator** |

When you build the whole UI in one go in the `sceneconnect` callback, no layer has been shown yet, so property changes all take effect immediately. Only later changes, in tap callbacks or timer callbacks, come with a transition.

Rules of transactions:

- Transactions can be nested. Settings not made in the inner one are inherited from the outer one. **Nesting is not verified in the simulator.**
- The settings affect only implicit animations. Animations added with `addAnimation()` are not affected by `setDisableActions(true)` and play as usual.

## Examples

```js
const shape = new CAShapeLayer();

CATransaction.begin();
CATransaction.setDisableActions(true);
shape.strokeEnd = 1;
CATransaction.commit();
```

**Effect**: `strokeEnd` becomes 1 immediately, and no new animation is added to the layer.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[CATransaction begin]` / `[CATransaction commit]` | `CATransaction.begin()` / `CATransaction.commit()` |
| `[CATransaction setDisableActions:YES]` | `CATransaction.setDisableActions(true)` |
| `[CATransaction setAnimationDuration:1.5]` | `CATransaction.setAnimationDuration(1.5)` |

## See also

- [Turning off implicit animations](../guides/animation.md#turning-off-implicit-animation)
- [`CALayer`](ca-layer.md): which properties come with implicit animations
