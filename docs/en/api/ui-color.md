---
type: reference
native: UIColor
status: partial
---

# `UIColor`

**`UIColor`** represents a color. In Nacre, colors are mostly written as strings: a view's background color, a label's text color, a layer's border color. Every property that accepts a color follows the same rules: you write a string, and you read a string back. `UIColor` objects exist globally, but everyday code doesn't need them; see [When you need a `UIColor` object](#when-you-need-a-uicolor-object).

```js
const view = new UIView();
view.backgroundColor = '#5856D6';
```

**Result**: The view's background turns indigo.

Strings come in five forms:

| Form | Examples | Description |
| --- | --- | --- |
| Hexadecimal | `'#5856D6'`, `'#ff000080'` | 3, 4, 6, or 8 digits. Letters are case-insensitive |
| `rgb()` | `'rgb(255, 59, 48)'`, `'rgba(0, 0, 0, 0.4)'` | Red, green, and blue are 0–255; opacity is 0–1 |
| Color name | `'systemBackground'`, `'label'`, `'white'` | Only [the 39 in the table](#color-names-you-can-use). Names are case-sensitive |
| Follows light/dark | `'light-dark(#ffffff, #1c1c1e)'` | Light Mode uses the first, Dark Mode uses the second |
| Asset Catalog | `'asset(BrandBlue)'` | Takes a color configured in the Xcode project |

For the full format, see [Supported forms](#supported-forms).

- **An invalid color doesn't crash the app.** Writing an invalid color doesn't throw; the property keeps its previous color and a warning is printed to the console. See [Invalid values warn instead of throwing](#invalid-values-warn-instead-of-throwing).
- **A valid string reads back exactly as written**, with case and whitespace unchanged. For the two exceptions, see [Strings you read back](#strings-you-read-back).
- **System colors, semantic colors, and `light-dark()` follow Light Mode and Dark Mode**; the system switches the color automatically when the user changes the appearance. Colors written in hexadecimal or `rgb()` are the same in both modes. Colors on layers are an exception; see [Light Mode and Dark Mode](#light-mode-and-dark-mode).

`UIColor` objects are immutable, have no instance properties or methods of their own, and fire no events.

**Inheritance**: `EventTarget` → `NSObject` → `UIColor`

For how to write fixed, semi-transparent, and light/dark colors, see the guide [Setting colors](../guides/colors.md).

## Constructor

`UIColor` can't be created with `new` and can't be subclassed. `new UIColor()` throws:

```
TypeError: Illegal constructor: UIColor is created by the runtime, not by new
```

**Not verified in the simulator.** `UIColor` objects can only be obtained from the static properties below.

## Static properties

There are 39, all read-only, all of type `UIColor`. Each property name is a [color name](#color-names-you-can-use) plus the `Color` suffix, the same as the name in Objective-C. Reading the same property always returns the same object.

| Group | Properties |
| --- | --- |
| Fixed colors | [`UIColor.blackColor`](ui-color/blackcolor.md) [`UIColor.darkGrayColor`](ui-color/darkgraycolor.md) [`UIColor.lightGrayColor`](ui-color/lightgraycolor.md) [`UIColor.whiteColor`](ui-color/whitecolor.md) [`UIColor.grayColor`](ui-color/graycolor.md) [`UIColor.redColor`](ui-color/redcolor.md) [`UIColor.greenColor`](ui-color/greencolor.md) [`UIColor.blueColor`](ui-color/bluecolor.md) [`UIColor.cyanColor`](ui-color/cyancolor.md) [`UIColor.yellowColor`](ui-color/yellowcolor.md) [`UIColor.magentaColor`](ui-color/magentacolor.md) [`UIColor.orangeColor`](ui-color/orangecolor.md) [`UIColor.purpleColor`](ui-color/purplecolor.md) [`UIColor.brownColor`](ui-color/browncolor.md) [`UIColor.clearColor`](ui-color/clearcolor.md) |
| System colors | [`UIColor.systemRedColor`](ui-color/systemredcolor.md) [`UIColor.systemGreenColor`](ui-color/systemgreencolor.md) [`UIColor.systemBlueColor`](ui-color/systembluecolor.md) [`UIColor.systemOrangeColor`](ui-color/systemorangecolor.md) [`UIColor.systemYellowColor`](ui-color/systemyellowcolor.md) [`UIColor.systemPinkColor`](ui-color/systempinkcolor.md) [`UIColor.systemPurpleColor`](ui-color/systempurplecolor.md) [`UIColor.systemTealColor`](ui-color/systemtealcolor.md) [`UIColor.systemIndigoColor`](ui-color/systemindigocolor.md) [`UIColor.systemBrownColor`](ui-color/systembrowncolor.md) [`UIColor.systemMintColor`](ui-color/systemmintcolor.md) [`UIColor.systemCyanColor`](ui-color/systemcyancolor.md) [`UIColor.systemGrayColor`](ui-color/systemgraycolor.md) |
| Semantic colors | [`UIColor.labelColor`](ui-color/labelcolor.md) [`UIColor.secondaryLabelColor`](ui-color/secondarylabelcolor.md) [`UIColor.tertiaryLabelColor`](ui-color/tertiarylabelcolor.md) [`UIColor.quaternaryLabelColor`](ui-color/quaternarylabelcolor.md) [`UIColor.placeholderTextColor`](ui-color/placeholdertextcolor.md) [`UIColor.separatorColor`](ui-color/separatorcolor.md) [`UIColor.opaqueSeparatorColor`](ui-color/opaqueseparatorcolor.md) [`UIColor.linkColor`](ui-color/linkcolor.md) [`UIColor.systemBackgroundColor`](ui-color/systembackgroundcolor.md) [`UIColor.secondarySystemBackgroundColor`](ui-color/secondarysystembackgroundcolor.md) [`UIColor.tertiarySystemBackgroundColor`](ui-color/tertiarysystembackgroundcolor.md) |

## Instance properties

`UIColor` has no instance properties of its own.

## Instance methods

`UIColor` has no instance methods of its own.

## Supported forms

| Form | Format | Example | Effect |
| --- | --- | --- | --- |
| Hexadecimal, 3 digits | `#rgb` | `'#f00'` | Each digit is doubled; same as `#ff0000`. Opaque |
| Hexadecimal, 4 digits | `#rgba` | `'#f00a'` | Same as `#ff0000aa`. The last digit is opacity |
| Hexadecimal, 6 digits | `#rrggbb` | `'#ff0000'` | Two digits each for red, green, and blue, `00`–`ff`. Opaque |
| Hexadecimal, 8 digits | `#rrggbbaa` | `'#ff000080'` | The last two digits are opacity: `00` is fully transparent, `ff` is opaque |
| `rgb()`, comma syntax | `rgb(r, g, b)`, `rgb(r, g, b, a)` | `'rgb(255, 0, 0)'`, `'rgba(255,0,0,.5)'` | See the component notes below |
| `rgb()`, space syntax | `rgb(r g b)`, `rgb(r g b / a)` | `'rgb(255 0 0)'`, `'rgb(255 0 0 / 50%)'` | Same as above |
| Follows light/dark | `light-dark(light, dark)` | `'light-dark(#fff, #000)'` | Light Mode shows the first, Dark Mode shows the second. Each argument can be any form in this table |
| Color name | A name from the table | `'systemBackground'` | See [Color names you can use](#color-names-you-can-use) |
| Asset Catalog | `asset(name)` | `'asset(BrandBlue)'` | The Color Set with this name in the Asset Catalog |
| Handle | `native(n)` | `'native(7)'` | Only ever obtained by reading; see [Strings you read back](#strings-you-read-back) |

Of these forms, "reads back exactly as written" has been verified in the acceptance tests for the four hexadecimal examples, the four `rgb()` examples, two `light-dark()` cases (hexadecimal arguments and color-name arguments), and color names. `asset()` and `native()` are **not verified in the simulator**.

Case and whitespace rules:

| Part | Case-sensitive |
| --- | --- |
| Hexadecimal letters | No. `'#FF0000'` and `'#ff0000'` are the same |
| Function names `rgb`, `rgba`, `light-dark`, `asset`, `native` | No |
| Color names | Yes. `'darkGray'` is valid; `'darkgray'` is not |
| The name inside `asset()` | Passed to the system for lookup as is |

Leading and trailing whitespace in the string is ignored. Hexadecimal colors must have exactly 3, 4, 6, or 8 digits.

**`rgb()` components**:

| Component | Range | Meaning |
| --- | --- | --- |
| Red, green, blue | A number 0–255, decimals allowed; or a percentage 0%–100% | 0 is none of that color; 255 or 100% is the strongest |
| Opacity | A number 0–1; or a percentage 0%–100% | 0 is fully transparent; 1 or 100% is opaque. Defaults to 1 when omitted |

The function names `rgb` and `rgba` are interchangeable; both accept three or four components. The runtime doesn't check whether components are in range, so don't write out-of-range values.

Besides strings, writes also accept `UIColor` objects, `null`, and `undefined`. `null` and `undefined` mean no color.

## Color names you can use

There are 39 in total. Names are case-sensitive. A name not in the table is treated as invalid, and the warning lists this table.

**Fixed colors**, 15. Their values are fixed and don't change with the appearance. The values below come from Apple's definitions, converted to 0–255 and rounded.

| Name | Value |
| --- | --- |
| `black` | `rgb(0, 0, 0)` |
| `darkGray` | `rgb(85, 85, 85)` |
| `lightGray` | `rgb(170, 170, 170)` |
| `white` | `rgb(255, 255, 255)` |
| `gray` | `rgb(128, 128, 128)` |
| `red` | `rgb(255, 0, 0)` |
| `green` | `rgb(0, 255, 0)` |
| `blue` | `rgb(0, 0, 255)` |
| `cyan` | `rgb(0, 255, 255)` |
| `yellow` | `rgb(255, 255, 0)` |
| `magenta` | `rgb(255, 0, 255)` |
| `orange` | `rgb(255, 128, 0)` |
| `purple` | `rgb(128, 0, 128)` |
| `brown` | `rgb(153, 102, 51)` |
| `clear` | Fully transparent |

The values of `green`, `orange`, `brown`, `darkGray`, and `lightGray` differ from the CSS colors with the same names; see [Same name, different value](#same-name-different-value).

**System colors**, 13. These are the colors commonly used in iOS interfaces; their values are determined by the system. Their values differ slightly between Light Mode and Dark Mode so they stay legible on both backgrounds.

`systemRed` `systemGreen` `systemBlue` `systemOrange` `systemYellow` `systemPink` `systemPurple` `systemTeal` `systemIndigo` `systemBrown` `systemMint` `systemCyan` `systemGray`

**Semantic colors**, 11. Named by purpose; their values are determined by the system and change with Light Mode, Dark Mode, and the Increase Contrast setting.

| Name | Purpose |
| --- | --- |
| `label` | Body text. Black in Light Mode, white in Dark Mode |
| `secondaryLabel` | Secondary text, lighter than `label` |
| `tertiaryLabel` | Tertiary text, lighter than `secondaryLabel` |
| `quaternaryLabel` | The lightest level of text |
| `placeholderText` | Placeholder text in text fields |
| `separator` | Separator lines. Semi-transparent; content behind shows through |
| `opaqueSeparator` | Separator lines, opaque |
| `link` | Link text |
| `systemBackground` | Page background. White in Light Mode, black in Dark Mode |
| `secondarySystemBackground` | Background for a layer of content placed on the page background |
| `tertiarySystemBackground` | Background for content placed on the second layer |

The values of `label` in both modes were measured (light `#000000`, dark `#ffffff`). The value of `systemBackground` comes from Apple's definition. For the other semantic colors only the purpose is given; their exact values haven't been measured.

"Reads back exactly as written" has been verified for `black`, `systemBlue`, `systemPink`, `systemYellow`, `systemTeal`, `label`, and `systemBackground`. The other names go through the same code and are **not individually verified in the simulator**.

## Invalid values warn instead of throwing

When you write an invalid color:

- Nothing is thrown; the code that follows keeps running.
- The property keeps its previous color. If it had no color, it still has none.
- A warning is printed to the console.

```js
const view = new UIView();
view.backgroundColor = '#0a7b55';
view.backgroundColor = '#GGG';
console.log(view.backgroundColor);
```

**Result**: Nothing is thrown. The console first prints the warning below, then `#0a7b55`. The view's background is still `#0a7b55`.

```text
[Nacre] backgroundColor: "#GGG" is not a valid color, ignored
```

The warning format is `[Nacre] <property or method name>: <value written> is not a valid color, ignored`. It appears in the same place as `console.warn()` output.

| Written | Warning |
| --- | --- |
| `'#GGG'` | `[Nacre] backgroundColor: "#GGG" is not a valid color, ignored` |
| `'light-dark(#fff)'` (one argument missing) | `[Nacre] backgroundColor: "light-dark(#fff)" is not a valid color, ignored` |
| `42` (not a string) | `[Nacre] backgroundColor: 42 is not a valid color, ignored` |
| `'nosuchColor'` | See below |

When the string starts with a letter and contains only letters and digits, the runtime treats it as a misspelled color name and lists every valid name after the warning:

```text
[Nacre] backgroundColor: "nosuchColor" is not a valid color, ignored; expected a color name, one of: black / darkGray / lightGray / white / gray / red / green / blue / cyan / yellow / magenta / orange / purple / brown / clear / systemRed / systemGreen / systemBlue / systemOrange / systemYellow / systemPink / systemPurple / systemTeal / systemIndigo / systemBrown / systemMint / systemCyan / systemGray / label / secondaryLabel / tertiaryLabel / quaternaryLabel / placeholderText / separator / opaqueSeparator / link / systemBackground / secondarySystemBackground / tertiarySystemBackground
```

"Doesn't throw" and "keeps the previous color" have been verified in the acceptance tests, for all four writes in the table above. The warning text comes from the runtime's code.

### What doesn't count as invalid

- **`null` and `undefined` are not invalid.** They mean "no color" and print no warning; see the guide [Setting colors](../guides/colors.md). So a misspelled constant such as `view.backgroundColor = Colors.brnad` yields `undefined`, and the result is that the color is removed with no indication at all.
- **`UIColor` objects are not invalid.** They are accepted directly.

### What is also treated as invalid

- Color names with the wrong case: `'Red'`, `'darkgray'`.
- Color names with the `Color` suffix: `'systemPinkColor'`. Strings can only use the short names from the table.
- CSS forms not supported here: `'hsl(0 100% 50%)'`, `'transparent'`.
- [`CAGradientLayer`](ca-gradient-layer.md)'s [`colors`](ca-gradient-layer/colors.md) is an array of colors. If any item is invalid, the whole array is not written.

### `asset()` throws when the name doesn't exist

When the name in `asset(name)` doesn't exist in the Asset Catalog, the runtime doesn't print a warning; it **throws `TypeError: cannot build a color from this specification`**. When you use `asset()`, make sure the name exists. **Not verified in the simulator.**

### Can the editor catch it early?

No. The type of a color is `string`; type checking can only confirm that you wrote a string. Whether its content is valid is known only at runtime. Both `'#GGG'` and `'sytemRed'` pass type checking.

This differs from [enums](enums.md), where an invalid value is reported by type checking.

### How to avoid mistakes

Define the colors your app uses as constants in one place and refer to them only by constant name everywhere else. Each color string then appears only once, and a misspelled constant name is caught by type checking. For how to write this, see the guide [Setting colors](../guides/colors.md).

## Light Mode and Dark Mode

Fixed colors (hexadecimal, `rgb()`, fixed color names) are the same in both modes. Semantic colors, system colors, `light-dark()`, and `asset()` produce **dynamic colors**: the color itself contains several values, and the system picks one at draw time based on the current appearance.

So a dynamic color only needs to be set once. When the user switches the appearance, the system redraws automatically; you don't need to assign it again.

Each view has its own appearance. By default it follows the system setting; you can also use `overrideUserInterfaceStyle` to lock a view and its subviews to light or dark. A dynamic color resolves according to the appearance of the view it is in, so the same `'label'` is white inside a card locked to dark, and black outside it.

When your code needs to know the current appearance, read `view.traitCollection.userInterfaceStyle`. When the appearance changes, views and scenes fire the `traitchange` event. Both are described in [`UITraitCollection`](ui-trait-collection.md). If you only want colors to follow the appearance, you don't need either.

**Colors on layers are an exception.** `layer.backgroundColor`, `layer.borderColor`, `layer.shadowColor`, a shape layer's `fillColor` and `strokeColor`, and a gradient layer's `colors` don't store dynamic colors:

- When you write a dynamic color, it is resolved to a fixed value using the appearance of the layer's view **at that moment**. A sublayer you create resolves using the appearance of the view it is attached to. This has been verified in the acceptance tests: after locking a view to dark, writing `layer.borderColor = 'label'` reads back `#ffffff`.
- Switching the appearance afterward doesn't change the layer's color.
- To follow the appearance, write the color again in the `traitchange` event; for how, see the guide [Supporting Dark Mode](../guides/dark-mode.md).

> **Note:** Right after a view's `overrideUserInterfaceStyle` is written, its appearance doesn't update immediately. A layer color written at this point still resolves using the old appearance. So write all layer colors in the `traitchange` callback.

## Strings you read back

A valid string is returned exactly as written, with the two exceptions below.

**The same color value written in different forms.** For colors written in hexadecimal or `rgb()`, the runtime records the form per color value. After the same color value is written anywhere in another form, reading returns the form written last.

```js
const box1 = new UIView();
const box2 = new UIView();
box1.backgroundColor = '#112233';
box2.backgroundColor = 'rgb(17, 34, 51)';   // same color value, different form
console.log(box1.backgroundColor);
```

**Effect**: The console prints `rgb(17, 34, 51)`, not `#112233`.

Different case also counts as a different form, for example `'#5856D6'` and `'#5856d6'`. If you use one form for a given color value throughout the app, you won't run into this; defining colors as constants in one place (see the guide [Setting colors](../guides/colors.md)) guarantees it. Color names and `light-dark()` are not affected.

**The color wasn't written by the app's code.** For example, a control's default color. In this case the runtime generates a string from the color's actual content:

| Color | Reads back as |
| --- | --- |
| One of the 39 colors in the table | Its name, for example `'label'` |
| An opaque fixed color | `'#rrggbb'`, lowercase |
| A semi-transparent fixed color | `'rgba(r, g, b, a)'`. `r`, `g`, `b` are integers 0–255; `a` has at most three decimal places |
| Anything else (unnamed dynamic colors, etc.) | `'native(n)'`, where `n` is an integer |

`native(n)` means the color can't be expressed in any of the forms above. It can be assigned as is to another color property, and the effect is the same color. It is valid only for the current run of the app; don't save it to a file or send it to a server.

Color properties on layers (`layer.borderColor`, etc.) aren't guaranteed to read back the string you wrote. When you write a dynamic color, reading returns the fixed value resolved at the moment of writing, generated according to this table. The acceptance tests verify that after writing `'#abcdef'`, the value read back is a string of the form `#rrggbb`.

## Properties that accept colors

Writing, reading, and invalid values for these properties and methods all follow the rules on this page.

| Class | Members |
| --- | --- |
| [`UIView`](ui-view.md) | `backgroundColor` |
| [`UILabel`](ui-label.md) | `textColor`, `highlightedTextColor`, `shadowColor` |
| [`UITextField`](ui-text-field.md) | `textColor` |
| [`UIImageView`](ui-image-view.md) | `tintColor` |
| [`UIButton`](ui-button.md) | `setTitleColor()`, `titleColorForState()`, `currentTitleColor` |
| [`UITabBar` and `UITabBarItem`](ui-tab-bar-controller.md) | `tintColor`, `unselectedItemTintColor`, `badgeColor` |
| [`CALayer`](ca-layer.md) | `backgroundColor`, `borderColor`, `shadowColor` |
| [`CAGradientLayer`](ca-gradient-layer.md) | `colors` (array of colors) |
| [`CAShapeLayer`](ca-shape-layer.md) | `fillColor`, `strokeColor` |
| [Animations](ca-animation.md) | Start and end values when animating a color property |

For each property's default value and what writing `null` means, see its own page.

## When you need a `UIColor` object

In everyday code, you don't. Strings can do everything a `UIColor` object can do here.

`UIColor` objects can only be obtained from the 39 [static properties](#static-properties). One can be assigned directly to a color property, with the same effect as writing the corresponding name:

```js
const box1 = new UIView();
box1.backgroundColor = UIColor.systemGreenColor;
console.log(box1.backgroundColor);
```

**Effect**: The box turns the system green. The console prints `systemGreen`. What you read back is still a string, not a `UIColor` object. The on-screen color is **not verified in the simulator**.

When writing code from iOS references, `UIColor.systemGreenColor` from those references can be used as is.

## Examples

### Boxes in four forms

Starting from a blank app, place four boxes on the page from top to bottom, setting each background with one of four forms.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const colors = ['#5856D6', 'rgb(255 59 48 / 50%)', 'label', 'light-dark(#34c759, #0a84ff)'];
  colors.forEach((color, i) => {
    const box = new UIView();
    box.frame = new CGRect(40, 100 + i * 100, 120, 80);
    box.backgroundColor = color;
    page.view.addSubview(box);
    console.log(box.backgroundColor);
  });
});
```

**Effect**

- The page shows four 120 × 80 pt boxes from top to bottom.
- The first box is indigo, the same in Light Mode and Dark Mode.
- The second box is semi-transparent red; the page background shows through.
- The third box is black in Light Mode and white in Dark Mode.
- The fourth box is green in Light Mode and blue in Dark Mode.
- The console prints the four strings that were written, in order.

"What you read back is the string you wrote" has been verified in the acceptance tests. The actual on-screen colors of the boxes and how they change when switching modes are **not verified in the simulator**. To switch between Light Mode and Dark Mode in the simulator, use the menu Features → Toggle Appearance.

For more forms, see the guide [Setting colors](../guides/colors.md).

## Corresponding iOS API

| Objective-C | JS |
| --- | --- |
| `[UIColor colorWithRed:1 green:0 blue:0 alpha:1]` | `'#ff0000'` or `'rgb(255, 0, 0)'` |
| `[UIColor colorWithRed:1 green:0 blue:0 alpha:0.5]` | `'rgba(255, 0, 0, 0.5)'` |
| `UIColor.systemBackgroundColor` | `'systemBackground'`, or `UIColor.systemBackgroundColor` |
| `UIColor.labelColor` | `'label'`, or `UIColor.labelColor` |
| `UIColor.clearColor` | `'clear'`, or `UIColor.clearColor` |
| `[UIColor colorWithDynamicProvider:^(UITraitCollection *t) { … }]`, returning two colors for light and dark | `'light-dark(light, dark)'` |
| `[UIColor colorNamed:@"BrandBlue"]` | `'asset(BrandBlue)'` |
| `view.backgroundColor = nil` | `view.backgroundColor = null` |
| `layer.borderColor = UIColor.redColor.CGColor` | `layer.borderColor = 'red'` |

Color components in Objective-C are decimals from 0 to 1. Red, green, and blue in `rgb()` are 0–255; multiply by 255 to convert.

The names in Swift have no `Color` suffix (`UIColor.systemBackground`) and match the color name strings here.

### Comparison with the browser

This section maps things for people familiar with CSS colors.

| | CSS | Here |
| --- | --- | --- |
| Writing an invalid color | Doesn't throw, keeps the previous value, no message | Doesn't throw, keeps the previous value, prints a warning |
| `light-dark()` | Takes effect only after `color-scheme` is declared | Takes effect as soon as you write it |
| Color names | Over a hundred, case-insensitive | 39, case-sensitive |
| System colors | `Canvas`, `CanvasText`, etc. | Semantic colors such as `systemBackground` and `label` |
| Fully transparent | `transparent` | `'clear'` or `null` |

#### Unsupported CSS forms

The following are valid in CSS but treated as invalid here (a warning is printed and the previous color is kept):

| CSS form | Alternative |
| --- | --- |
| `hsl()`, `hsla()`, `hwb()` | Convert to `rgb()` |
| `lab()`, `lch()`, `oklab()`, `oklch()`, `color(display-p3 …)` | No alternative; wide-gamut colors can't be written |
| `color-mix()`, relative color syntax (`rgb(from …)`) | Compute the result yourself and write that |
| `transparent` | `'clear'` or `null` |
| `currentColor` | No alternative |
| CSS color names not in the table: `pink`, `navy`, `rebeccapurple`, etc. | Write hexadecimal |
| Names with different case: `Red`, `darkgray` | Use the case from the table: `red`, `darkGray` |
| CSS system colors: `Canvas`, `CanvasText`, etc. | Semantic colors such as `systemBackground` and `label` |

#### Same name, different value

These names also exist in CSS, but with different values. Using them from your CSS intuition gives you a different color.

| Name | Value here | Value of the CSS color with the same name |
| --- | --- | --- |
| `green` | `rgb(0, 255, 0)` | `#008000`. `green` here equals CSS `lime` |
| `orange` | `rgb(255, 128, 0)` | `#ffa500` |
| `brown` | `rgb(153, 102, 51)` | `#a52a2a` |
| `darkGray` | `rgb(85, 85, 85)` | `darkgray` is `#a9a9a9` |
| `lightGray` | `rgb(170, 170, 170)` | `lightgray` is `#d3d3d3` |

The other fixed colors with the same names (`black`, `white`, `gray`, `red`, `blue`, `cyan`, `yellow`, `magenta`, `purple`) have the same values.

## See also

- [Setting colors](../guides/colors.md): fixed colors, semi-transparency, semantic colors, `light-dark()`, Asset Catalog, reading back and comparing
- [Supporting Dark Mode](../guides/dark-mode.md): making layer colors follow Light Mode and Dark Mode
- [`UITraitCollection`](ui-trait-collection.md): reading whether the current appearance is light or dark, and the `traitchange` event
- [`UIView`](ui-view.md): where `backgroundColor` is
- [`CALayer`](ca-layer.md): border and shadow colors
- [Enums](enums.md): invalid enum values are reported by type checking; at runtime, invalid writes to enum properties are handled the same way as colors: a warning is printed and the previous value is kept
- [Units](units.md)
