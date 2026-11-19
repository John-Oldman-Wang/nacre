---
type: reference
native: CAKeyframeAnimation.rotationMode
---

# `CAKeyframeAnimation`: `rotationMode` property

The **`rotationMode`** property determines whether the layer turns to follow the direction of travel when moving along a [path](path.md).

## Value

One of these three:

| Value | Effect |
| --- | --- |
| `null` | The layer does not turn |
| `'auto'` | The layer turns to face the direction of travel |
| `'autoReverse'` | The layer turns to face opposite the direction of travel |

- Readable and writable.
- The default is `null`.
- Only used when [`path`](path.md) is set. A round layer looks the same when turned; only an elongated layer shows a difference.

### Invalid values

Writing a value not in the table does not throw. The console prints a warning listing all available values, and `rotationMode` keeps its previous value.

## Examples

```js
const trail = new UIBezierPath();
trail.moveToPoint(new CGPoint(30, 130));
trail.addQuadCurveToPoint(new CGPoint(270, 130), { controlPoint: new CGPoint(150, 10) });

const walk = CAKeyframeAnimation.animationWithKeyPath('position');
walk.path = trail;
walk.rotationMode = 'auto';
walk.duration = 2.4;
```

**Effect**: After it is added to an elongated layer, the layer moves along the arc with its long side always facing the direction of travel. **Not verified in the simulator.**

## Corresponding iOS API

`CAKeyframeAnimation.rotationMode`. `kCAAnimationRotateAuto` is written `'auto'`, and `kCAAnimationRotateAutoReverse` is written `'autoReverse'`.

## See also

- [`path`](path.md)
