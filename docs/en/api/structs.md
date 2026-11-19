---
type: reference
---

# Structs

A **struct** represents one value made up of several numbers: a point, a size, a rectangle, a set of insets, a transform matrix. The values of properties such as a view's position (`frame`), scroll position (`contentOffset`), margins (`layoutMargins`), and transform (`transform`) are all structs.

Each kind of struct is a global class, constructed with `new`. A struct holds only numbers and does not correspond to anything in the UI: when you assign a `CGRect` to `view.frame`, the view records those four numbers, and from then on that `CGRect` object has nothing to do with the view.

| Class | Fields | Represents | Unit |
| --- | --- | --- | --- |
| [`CGPoint`](cg-point.md) | `x` `y` | A point | [pt](units.md) |
| [`CGSize`](cg-size.md) | `width` `height` | A size | pt |
| [`CGRect`](cg-rect.md) | `x` `y` `width` `height` | A rectangle: the position of its top-left corner plus a size | pt |
| [`UIEdgeInsets`](ui-edge-insets.md) | `top` `left` `bottom` `right` | How far each of the four edges is inset | pt |
| [`NSDirectionalEdgeInsets`](ns-directional-edge-insets.md) | `top` `leading` `bottom` `trailing` | Same as above, with left and right replaced by the two sides distinguished by text direction | pt |
| [`CGAffineTransform`](cg-affine-transform.md) | `a` `b` `c` `d` `tx` `ty` | A 2D affine transform matrix | `tx` `ty` are pt; the rest are ratios |
| [`CAFrameRateRange`](ca-frame-rate-range.md) | `minimum` `maximum` `preferred` | A frame-rate range; see [`CADisplayLink`](ca-animation.md) | Frames per second |

For each class's constructor and fields, see its own page. This page covers the rules shared by all structs.

`leading` is the side where text begins and `trailing` is the side where text ends. In left-to-right languages `leading` is the left and `trailing` is the right; in right-to-left languages the two are swapped.

## Complete example

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const box = new UIView();
  box.backgroundColor = 'systemIndigo';
  page.view.addSubview(box);

  // 1. Write with a struct instance
  box.frame = new CGRect(40, 100, 200, 120);

  // 2. What is read back is a CGRect instance
  const f = box.frame;
  console.log(String(f), f.width, f.origin.x);

  // 3. To change only one field: construct a new one from the old values of the other fields and assign the whole thing back
  box.frame = new CGRect(f.x, 300, f.width, f.height);

  // 4. When writing, a plain object with fields of the same names also works
  box.frame = { x: 40, y: 300, width: 200, height: 60 };
});
```

**Effect**

- There is an indigo rectangle on screen, 40 pt from the left edge of the screen and 300 pt from the top, 200 pt wide and 60 pt tall.
- The console prints `CGRect(40, 100, 200, 120) 200 40`.

The examples in the following sections reuse the `box` from here.

## Fields are read-only; replace the whole struct to change one

A struct's fields cannot be assigned. Assigning throws `TypeError`:

```js
try {
  // @ts-expect-error the field is read-only, and type checking also reports an error
  box.frame.x = 10;
} catch (err) {
  console.log(String(err));
}
```

**Result**

- The console prints `TypeError: x is read-only: structs are values, assign a whole new one instead`.
- `box`'s position does not change.

Each read of `box.frame` gives a copy of the view's current position; changing its fields would not move the view.

**The recommended pattern** is to read the old value, construct a new one from its fields, and assign the whole thing back:

```js
const f = box.frame;
box.frame = new CGRect(10, f.y, f.width, f.height);
```

**Effect**

- `box`'s left edge moves to 10 pt; its top, width, and height stay the same.

When you only want to move it without changing its size, you can write `center`, which has only two fields:

```js
box.center = new CGPoint(box.center.x + 20, box.center.y);
```

**Effect**

- `box` moves 20 pt to the right.

New properties cannot be added to a struct object either: `f.note = 1` also throws `TypeError`.

## Plain objects can be given when writing

Properties and method parameters that accept a struct accept both struct instances and plain objects with fields of the same names. Both forms give the same result:

```js
box.frame = new CGRect(60, 270, 160, 80);
box.frame = { x: 60, y: 270, width: 160, height: 80 };
```

**Effect**

- Both lines place `box` at (60, 270), 160 pt wide and 80 pt tall.

Both forms write the same value, so choose by readability: when there are many fields and the order is easy to get wrong, write a plain object so the field names appear in the code; when there are few, clear numbers, write `new CGPoint(x, y)`.

Rules for plain objects:

| Situation | Result |
| --- | --- |
| All fields present, values are finite numbers | The write succeeds |
| One field missing | Throws `TypeError`; the missing field is not treated as 0 |
| A field's value is not a finite number (`NaN`, `Infinity`, `undefined`, `'abc'`) | Throws the same `TypeError` |
| A field's value is a string that can be converted to a number (`'60'`) | Used as a number. Type checking reports an error, so writing it this way is not recommended |
| Extra fields | The extra fields are ignored |
| What is given is not an object (`null`, a number, a string) | Throws `TypeError` |

The error message starts with the property or method name:

```js
try {
  // @ts-expect-error height is missing, and type checking also reports an error
  box.frame = { x: 60, y: 270, width: 160 };
} catch (err) {
  console.log(String(err));
}

try {
  // @ts-expect-error not an object
  box.frame = null;
} catch (err) {
  console.log(String(err));
}
```

**Result**

- The first block prints `TypeError: frame is missing height, or it is not a finite number`.
- The second block prints `TypeError: frame needs an object with all of: x, y, width, height`.
- Neither assignment takes effect, and `box.frame` keeps its original value.

Missing fields and wrong types can be caught while writing code: with [type checking](native-classes.md) turned on, the editor reports errors at both places.

## Reads return new objects

Each read of a struct property gives a newly created instance. It records the value at the moment of reading; if the view moves afterward, the numbers in this instance do not change with it.

```js
const before = box.frame;
box.frame = new CGRect(0, 0, 50, 50);

console.log(before.width);                 // the value at the time of reading
console.log(box.frame === box.frame);      // two reads are two objects
console.log(box.frame instanceof CGRect);
```

**Result**

- The first line prints the width before the change, not `50`.
- The second line prints `false`.
- The third line prints `true`. Even when a plain object was given on write, what is read back is a `CGRect` instance.

So structs cannot be compared with `===`. To compare whether two structs are equal, compare them field by field, or compare their string forms:

```js
const a = new CGPoint(10, 20);
const b = new CGPoint(10, 20);

console.log(a === b);                         // false
console.log(a.x === b.x && a.y === b.y);      // true
console.log(String(a) === String(b));         // true
```

**Result**

- Prints `false`, `true`, and `true` in turn.

## Constructor arguments

Constructor arguments are converted as numbers:

| Value given | Result |
| --- | --- |
| Omitted (`undefined`) | The field is 0. `new CGPoint()` gives `CGPoint(0, 0)` |
| A value that can be converted to a number (`'3'`, `null`, `true`) | Used as the result of `Number()`: `3`, `0`, `1`. Type checking reports an error, so writing it this way is not recommended |
| Cannot be converted to a finite number (`NaN`, `Infinity`, `'abc'`) | Throws `TypeError: a struct field must be a finite number, got NaN` (ending with the value received) |

The difference between constructors and "giving a plain object when writing" lies in missing values: a constructor treats omitted arguments as 0, while a plain object missing a field throws.

## Numeric precision

A struct's fields are ordinary JS numbers (64-bit floating point). Integer values read back as the same number after being written.

Values with fractions may come back differing from the written value in the last few digits after going through the system's calculations. The acceptance tests compare round trips of transform matrices only to 4 decimal places; exact equality is **not verified in the simulator**. Leave a tolerance when comparing fields with fractions:

```js
box.transform = CGAffineTransform.rotation(Math.PI / 6);
const t = box.transform;
console.log(Math.abs(t.a - Math.cos(Math.PI / 6)) < 0.0001);
```

**Result**

- Prints `true`.

## Converting to strings and JSON

Each kind of struct converts to a string as "ClassName(field values, …)", with the fields in the order of the constructor's parameters. `JSON.stringify` outputs each field:

```js
const r = new CGRect(10, 20, 100, 50);

console.log(String(r));
console.log(JSON.stringify(r));
console.log(String(new UIEdgeInsets(8, 16, 8, 16)));
```

**Result**

- The first line prints `CGRect(10, 20, 100, 50)`.
- The second line prints `{"x":10,"y":20,"width":100,"height":50}`. `origin` and `size` do not appear in the JSON.
- The third line prints `UIEdgeInsets(8, 16, 8, 16)`.

## Comparison with native iOS code

| ObjC | JS |
| --- | --- |
| `CGPointMake(10, 20)` | `new CGPoint(10, 20)` |
| `CGSizeMake(100, 50)` | `new CGSize(100, 50)` |
| `CGRectMake(0, 0, 100, 50)` | `new CGRect(0, 0, 100, 50)` |
| `UIEdgeInsetsMake(8, 16, 8, 16)` | `new UIEdgeInsets(8, 16, 8, 16)` |
| `NSDirectionalEdgeInsetsMake(8, 16, 8, 16)` | `new NSDirectionalEdgeInsets(8, 16, 8, 16)` |
| `rect.origin.x` | `rect.origin.x` or `rect.x` |
| `rect.size.width` | `rect.size.width` or `rect.width` |
| `view.frame = CGRectMake(…)` | `view.frame = new CGRect(…)` or `= { x, y, width, height }` |
| `CGAffineTransformIdentity` | `CGAffineTransform.identity` |
| `CGAffineTransformMakeScale(sx, sy)` | `CGAffineTransform.scale(sx, sy)` |
| `CGAffineTransformMakeTranslation(tx, ty)` | `CGAffineTransform.translation(tx, ty)` |
| `CGAffineTransformMakeRotation(r)` | `CGAffineTransform.rotation(r)` |
| `CGAffineTransformConcat(t1, t2)` | `t1.concat(t2)` |
| `CGAffineTransformInvert(t)` (returns `t` itself when not invertible) | `t.invert()` (returns `null` when not invertible) |
| `CGAffineTransformIsIdentity(t)` | `t.isIdentity` |

For each struct's own mapping, see its page.

## See also

- [Units](units.md): what pt is, and radians versus degrees.
- The class page of each struct: [`CGPoint`](cg-point.md), [`CGSize`](cg-size.md), [`CGRect`](cg-rect.md), [`UIEdgeInsets`](ui-edge-insets.md), [`NSDirectionalEdgeInsets`](ns-directional-edge-insets.md), [`CGAffineTransform`](cg-affine-transform.md), [`CAFrameRateRange`](ca-frame-rate-range.md).
- [`UIView`](ui-view.md): what `frame`, `bounds`, `center`, and `transform` mean, and how a transform affects `frame`.
- [Native classes](native-classes.md): the conversion rules for number, string, and object parameters, and how to turn on type checking.
