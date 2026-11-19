---
type: reference
native: NSShadow
status: partial
---

# `NSShadow`

**`NSShadow`** represents a text shadow: its offset, blur radius, and color. Once set up, it goes into an [attributed string](ns-attributed-string.md) as the `shadow` attribute.

What goes into the attributed string is a copy as of that moment: changing this object afterward does not change attributed strings already created. A shadow read back from an attributed string is also a copy.

`NSShadow` fires no events. Its values are only changed by the app's own code, so there are no change notifications.

**Inheritance**: `EventTarget` → `NSObject` → `NSShadow`

## Constructor

[`NSShadow()`](ns-shadow/constructor.md)

Creates a shadow with an offset of `(0, 0)`, no blur, and a color of black at one-third opacity.

## Instance properties

Also inherits the properties of `NSObject`.

| Property | Description |
| --- | --- |
| [`shadowOffset`](ns-shadow/shadowoffset.md) | How far the shadow is offset from the text |
| [`shadowBlurRadius`](ns-shadow/shadowblurradius.md) | The blur radius |
| [`shadowColor`](ns-shadow/shadowcolor.md) | The shadow's color |

## Instance methods

`NSShadow` has no instance methods of its own.

## Examples

```js
const shadow = new NSShadow();
shadow.shadowOffset = new CGSize(0, 1);
shadow.shadowBlurRadius = 2;
shadow.shadowColor = 'rgba(0, 0, 0, 0.4)';

const label = new UILabel();
label.attributedText = new NSAttributedString('With shadow', { shadow });
```

**Effect** (not verified in the simulator): 1 pt below the text is a faint black shadow with blurred edges.

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[NSShadow alloc] init]` | `new NSShadow()` |
| `shadow.shadowOffset = CGSizeMake(0, 1)` | `shadow.shadowOffset = new CGSize(0, 1)` |
| `shadow.shadowColor = [UIColor colorWithWhite:0 alpha:0.4]` | `shadow.shadowColor = 'rgba(0, 0, 0, 0.4)'` |
| `NSShadowAttributeName: shadow` | `{ shadow }` |

## See also

- [`NSAttributedString`](ns-attributed-string.md): the `shadow` attribute
- [`UILabel.shadowColor`](ui-label/shadowcolor.md): a text shadow for the whole label, with no blur radius
- [`CALayer`](ca-layer.md): layer shadows
