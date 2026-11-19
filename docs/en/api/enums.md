---
type: concept
status: partial
---

# Enums

An **enum** is a value chosen from a fixed set of options. For example, text alignment can only be one of five: left, center, right, justified, or following the language's writing direction. In Nacre's API, enum values are always strings: you write a string and you read back a string.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();
  label.frame = { x: 20, y: 100, width: 300, height: 40 };
  label.text = 'Hello';
  label.textAlignment = 'center';           // write a value
  page.view.addSubview(label);

  console.log(label.textAlignment);         // reading gives a string too
});
```

**Effect**

- The screen shows a line of text, `Hello`, centered within a 300 pt width.
- The console logs `center`.

Which values each enum has, and what each value does, is documented on the page of the class that uses it. This page describes the rules shared by all enums. The examples below reuse `label` and `page` from here.

## Value names

Value names are case-sensitive, start with a lowercase letter, and join multiple words in camel case: `'center'`, `'scaleAspectFit'`, `'byTruncatingTail'`.

The strings you read back and the strings you can write are the same set, so a value read back can be compared directly with a string, or written back as is:

```js
if (label.textAlignment === 'center') {
  label.textAlignment = 'natural';
}
```

**Effect**

- If the text was centered, it changes to align with the language's writing direction (left-aligned in left-to-right languages).

Readers familiar with iOS can derive these names from iOS constant names; the rule is in the [mapping table](#comparison-with-native-ios-code) at the end of this page. Readers new to iOS don't need the rule: every class page lists all values, and so do the warning and error messages when a value is wrong.

## What happens with an invalid value

When you write a value that isn't in the list, the result depends on where the enum appears:

| Where the enum appears | Invalid values |
| --- | --- |
| Assigning to a property: `label.textAlignment = '…'` | No exception. The property keeps its previous value, and a warning is logged to the console |
| A method parameter, a member of an options object, a constructor parameter | Throws `TypeError`; the call has no effect |

In both cases the message lists all valid values.

### Properties: a warning, and the value is unchanged

```js
label.textAlignment = 'center';
// @ts-expect-error there is no 'centre' value; type checking reports an error
label.textAlignment = 'centre';
console.log(label.textAlignment);

// @ts-expect-error there is no 'night' value
page.view.overrideUserInterfaceStyle = 'night';
console.log(page.view.overrideUserInterfaceStyle);
```

**Effect**

- Neither invalid assignment throws, and the statements after them run as usual.
- The console first logs the warning `[Nacre] textAlignment has no value "centre"; expected one of: left / center / right / justified / natural, ignored`, then logs `center`: the assignment had no effect and the property kept its previous value.
- It then logs the warning `[Nacre] overrideUserInterfaceStyle has no value "night"; expected one of: unspecified / light / dark, ignored`, then logs `unspecified`.

The warning is logged with `console.warn`. It starts with `[Nacre] `, contains the property name, the value written, and all valid values, and ends with `, ignored`.

What you probably want to know at this point:

- **Does the App crash, and does the following code still run?** It doesn't crash. The assignment doesn't throw, and the statements after it run as usual.
- **Is the previous value still there?** Yes. The property keeps the value it had before the write; it is not reset to the default.
- **How do I find out it was wrong?** Type checking reports an error while you write the code; see [the next section](#catching-errors-while-writing-code). At runtime, look for the warning in the console, or read the property back after assigning.
- **Does wrong capitalization count as an error?** Yes. `'Center'` and `'center'` are different strings.
- **What about a number or `null`?** Same thing: a warning, and the property keeps its previous value. Enums do no type conversion. A few properties include `null` in their type (the type column of the class page says "or `null`"); for those, `null` is a valid value.

An invalid [color](ui-color.md) also logs a warning and keeps the previous value.

### Method parameters, options, constructor parameters: `TypeError`

```js
try {
  // @ts-expect-error there is no 'subtitle' text style
  label.font = UIFont.preferredFontForTextStyle('subtitle');
} catch (err) {
  console.log(String(err));
}
```

**Effect**

- The console logs `TypeError: textStyle has no value "subtitle"; expected one of: largeTitle / title1 / title2 / title3 / headline / subheadline / body / callout / footnote / caption1 / caption2`.
- The call stops where it throws; `label.font` is not assigned, and the text's font stays the same.

What is thrown is an ordinary JS exception. You can catch it with `try / catch`, and the App doesn't crash. If it isn't caught, the code stops where it threw, the statements after it don't run, and the runtime passes the exception to the `error` event of [`application`](application.md) and logs it to the console.

Wrong capitalization or a number also throws `TypeError`.

## Catching errors while writing code

**Turning on type checking is recommended.** The type definitions (`@nacrejs/types`) declare each enum as the set of all its values, so an invalid value is flagged in the editor without waiting to run. This works for enums in properties as well as in method parameters. For setup, see [Building your own app](../guides/your-own-app.md).

```js
// @ts-expect-error
label.textAlignment = 'centre';
```

Type checking reports on this line:

```
Type '"centre"' is not assignable to type 'NSTextAlignment'. Did you mean '"center"'?
```

The editor also lists all values to choose from as you type the quote.

`// @ts-expect-error` is a comment for the type checker meaning "the next line is wrong on purpose". The examples on this page use it to mark invalid code; normal code doesn't need it.

When the value comes from a variable and type checking can't infer the exact string (for example, user input or the network), only the runtime can catch an invalid value:

- **Properties**: an invalid write doesn't throw. To find out whether a write took effect, read the property back after assigning and compare it with what you wrote. A few values read back under a different name than the one written; see [Values with two names for one effect](#values-with-two-names-for-one-effect).
- **Method parameters, options, constructor parameters**: wrap the call in `try / catch`.

## Selecting several at once: arrays of strings

Some values aren't "pick one" but "pick some", such as which of a rectangle's four corners are rounded. These are written as arrays of strings, each item being one value:

```js
const card = new UIView();
card.frame = { x: 20, y: 160, width: 200, height: 100 };
card.backgroundColor = 'systemBlue';
page.view.addSubview(card);

const layer = card.layer;
layer.cornerRadius = 16;
layer.maskedCorners = ['minXMinY', 'maxXMinY'];

console.log(layer.maskedCorners.join(','));
console.log(layer.maskedCorners.includes('minXMaxY'));
```

**Effect**

- The screen shows a blue rectangle whose top two corners are rounded with a 16 pt radius and whose bottom two corners are square.
- The console logs `minXMinY,maxXMinY` and `false`.

Rules:

| Case | Result |
| --- | --- |
| Empty array `[]` | Nothing selected. For `maskedCorners`, no corner is rounded |
| Only one item | Still written as an array: `['minXMinY']`. Writing the string `'minXMinY'` directly throws `TypeError` |
| The same item twice | Same as once |
| An unrecognized name in the array | The whole assignment has no effect; the recognized items aren't applied on their own. A property doesn't throw, keeps its previous value, and logs a warning to the console; a method parameter throws `TypeError` |

Reads also return an array. The order of items in it is fixed and doesn't depend on the order written, so check whether an item is selected with `includes()` rather than comparing indexes.

Writing an unrecognized name to a property and writing a non-array value to it have different results. The first is an invalid value; the second is the wrong type:

```js
layer.maskedCorners = ['minXMinY', 'maxXMinY'];
// @ts-expect-error there is no 'topLeft' value
layer.maskedCorners = ['maxXMaxY', 'topLeft'];
console.log(layer.maskedCorners.join(','));

try {
  // @ts-expect-error needs an array, not a single string
  layer.maskedCorners = 'minXMinY';
} catch (err) {
  console.log(String(err));
}
```

**Effect**

- The second assignment doesn't throw. The console logs the warning `[Nacre] maskedCorners has no value "topLeft"; expected one of: minXMinY / maxXMinY / minXMaxY / maxXMaxY, ignored`, then logs `minXMinY,maxXMinY`: the recognized `'maxXMaxY'` in the array was not applied on its own, and the property kept its previous value.
- The last part logs `TypeError: maskedCorners needs an array of names; expected any of: minXMinY / maxXMinY / minXMaxY / maxXMaxY`.

Where arrays of strings are used:

| Where | Values | Documentation |
| --- | --- | --- |
| `layer.maskedCorners` | Which corners are rounded | [`CALayer`](ca-layer.md) |
| `byRoundingCorners` of `UIBezierPath.bezierPathWithRoundedRect()` | Which corners are rounded | [`UIBezierPath`](ui-bezier-path.md) |
| `control.state` (read-only) | Which states the control is currently in | [`UIControl`](ui-control.md) |
| `forState` of `button.setTitle()` and similar methods | Which combination of states the setting applies to | [`UIButton`](ui-button.md) |
| `control.sendActionsForControlEvents()` | Which control events to trigger | [`UIControl`](ui-control.md) |

`maskedCorners` is a property; an invalid value logs a warning and leaves the value unchanged. `byRoundingCorners`, `forState`, and the parameter of `sendActionsForControlEvents()` are method parameters; an unrecognized name in the array throws `TypeError`. `control.state` is read-only.

## Values with two names for one effect

In a few enums, two names mean the same effect. Both names can be written, and reads always return one fixed name:

```js
const row = new UIStackView();
row.alignment = 'top';
console.log(row.alignment);
```

**Result**

- Logs `leading`, not `top`.

| Enum | Names equivalent when written | Reads back as |
| --- | --- | --- |
| `alignment` of [`UIStackView`](ui-stack-view.md) | `'top'` and `'leading'` | `'leading'` |
| Same as above | `'bottom'` and `'trailing'` | `'trailing'` |
| `style` of [`UIBarButtonItem`](ui-bar-button-item.md) | `'done'` and `'prominent'` | `'prominent'` |

So for these properties, don't assume the string read back equals the string written. Compare against the name that is read back.

## Properties that can be a number or a name

A few properties are normally a number but also accept a name with a special meaning:

| Property | Type | What the name means |
| --- | --- | --- |
| `spacing` of [`UIStackView`](ui-stack-view.md) | A number (pt) or `'system'` | `'system'` means use the system's standard spacing |
| `priority` of a constraint | A number (1 to 1000) or a name such as `'required'` | See [Auto Layout](auto-layout.md) |
| `decelerationRate` of [`UIScrollView`](ui-scroll-view.md) | A number, or `'normal'` or `'fast'` | The system's two preset deceleration rates |

```js
row.spacing = 12;
console.log(row.spacing);

row.spacing = 'system';
console.log(row.spacing);
```

**Effect**

- Logs `12` and then `system`. After writing a name, reading gives back the name, not a number.

When reading such a property, check its type first: `typeof row.spacing === 'number'`.

Writing an unrecognized name to such a property behaves like other enum properties: no exception, the property keeps its previous value, and a warning is logged to the console.

```js
row.spacing = 12;
// @ts-expect-error the only name is 'system'
row.spacing = 'default';
console.log(row.spacing);
```

**Effect**

- The assignment doesn't throw. The console logs the warning `[Nacre] spacing has no value "default"; expected one of: a number / "system", ignored`, then logs `12`.

When the value written is neither a string nor convertible to a number (such as `undefined` or an object), it is the wrong type and throws `TypeError`. A string that looks like a number is treated as a number: `'12'` is 12.

## Values that aren't enums in iOS but are also written as strings here

Font weights and text styles are constants rather than enums in iOS, but here they are written the same way as enums. They all appear in method parameters, so an invalid value throws `TypeError`:

```js
label.font = UIFont.systemFontOfSize(17, { weight: 'semibold' });
label.font = UIFont.preferredFontForTextStyle('headline');

try {
  // @ts-expect-error there is no 'extrabold' weight
  UIFont.systemFontOfSize(17, { weight: 'extrabold' });
} catch (err) {
  console.log(String(err));
}
```

**Effect**

- The text first becomes 17 pt semibold, then the system "headline" style.
- The console logs `TypeError: weight has no value "extrabold"; expected one of: ultraLight / thin / light / regular / medium / semibold / bold / heavy / black`.

| Type | Example values | Documentation |
| --- | --- | --- |
| Font weight `UIFontWeight` | `'regular'`, `'semibold'`, `'bold'` | [`UIFont`](ui-font.md) |
| Text style `UIFontTextStyle` | `'body'`, `'headline'`, `'largeTitle'` | [`UIFont`](ui-font.md) |

Event names are not in this group: event names are open-ended, and listening for a name an object never fires doesn't throw; it is treated as a custom event.

## "No such thing" is not an invalid value

An invalid value and "the thing you're looking for doesn't exist" are two different cases with different results:

```js
const font = UIFont.fontWithName('NoSuchFont', { size: 17 });
console.log(font);
```

**Result**

- Logs `null`, without throwing.

A font name is not an enum: which fonts are installed on the system isn't fixed, and a name that finds no font is a normal result, so it returns `null`. `'extrabold'` is not in the list of font weights, which means the code is wrong, so it throws. For methods whose return value can be `null`, check for `null` before using the return value.

## Comparison with native iOS code

To get the JS string from an iOS constant name: remove the prefix that names the type, then lowercase the first letter of what remains.

| ObjC | JS |
| --- | --- |
| `NSTextAlignmentCenter` | `'center'` |
| `NSLineBreakByTruncatingTail` | `'byTruncatingTail'` |
| `UIViewContentModeScaleAspectFit` | `'scaleAspectFit'` |
| `UIImageRenderingModeAlwaysTemplate` | `'alwaysTemplate'` |
| `NSLayoutRelationGreaterThanOrEqual` | `'greaterThanOrEqual'` |
| `UIFontWeightSemibold` | `'semibold'` |
| `UIFontTextStyleLargeTitle` | `'largeTitle'` |
| `kCACornerCurveContinuous` | `'continuous'` |
| `kCALayerMinXMinYCorner \| kCALayerMaxXMinYCorner` | `['minXMinY', 'maxXMinY']` |
| `UIControlStateNormal` | `['normal']` |
| `UIControlStateSelected \| UIControlStateDisabled` | `['selected', 'disabled']` |
| `UIStackViewSpacingUseSystem` | `'system'` |

## See also

- [Colors](ui-color.md): another kind of value written as a string; an invalid one also logs a warning and keeps the previous value.
- [Native classes](native-classes.md): how to turn on type checking, and the conversion rules for numbers, strings, and objects as parameters.
- [Structs](structs.md): values made of several numbers.
