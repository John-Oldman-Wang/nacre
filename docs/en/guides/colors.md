# Setting colors

This guide shows how to set colors on views, text, and layers: fixed colors, translucent colors, colors that follow light and dark mode, colors from an Asset Catalog, and how to read, compare, and remove colors. Colors are written as strings; every syntax and rule is on the [`UIColor`](../api/ui-color.md) reference page.

## Recommended approach

**Define your colors centrally as constants.** Write the colors your app uses in one place and refer only to the constant names elsewhere:

```js
// The app's colors are written only once, here
const Colors = {
  brand: '#5856D6',
  danger: 'systemRed',
  text: 'label',
  cardBackground: 'light-dark(#ffffff, #1c1c1e)',
  overlay: 'rgba(0, 0, 0, 0.4)',
};

const view = new UIView();
view.backgroundColor = Colors.brand;
```

**Result**: the view's background turns indigo.

This has three benefits:

- **Each color string appears only once.** There is only one place to get it wrong. After the app starts, look through the console once: if there is no `is not a valid color` warning, all the strings are valid.
- **Type checking catches misspelled constant names.** With type checking on, `Colors.brnad` reports that the property does not exist. A misspelled color string is not reported, but a misspelled constant name is. Without type checking, `Colors.brnad` is `undefined`, which removes the color with no warning, so keep type checking on.
- **Each color value has only one spelling.** When the same color value is written with two different spellings, the string read back becomes whichever was written last; see [The string you read back](../api/ui-color.md#strings-you-read-back). Centralizing avoids this.

**For colors that follow light and dark mode, prefer semantic colors** (`'label'`, `'systemBackground'`). The system maintains semantic colors, and they have appropriate values in light mode, dark mode, and with Increase Contrast. For brand colors the system does not provide, write two values with `light-dark()`.

`asset(name)` keeps color values in an Xcode Asset Catalog, where you can configure separate values for light, dark, and high contrast. It suits apps whose Xcode project is maintained by hand. Apps whose project is generated with the [`@nacrejs/ios` command-line tool](your-own-app.md) currently have no way to add colors: the generated `ios/` directory is rebuilt every time, and its Asset Catalog contains only the app icon. Use the constants approach above for such projects.

## First example

Starting from a blank app, place four color blocks on the page from top to bottom, setting each background with a different syntax.

```js
application.addEventListener('sceneconnect', (e) => {
  // Create the window and view controller. Every app needs these lines
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. Fixed color: hex
  const box1 = new UIView();
  box1.frame = new CGRect(40, 100, 120, 80);
  box1.backgroundColor = '#5856D6';
  page.view.addSubview(box1);

  // 2. With transparency: red 255, green 59, blue 48, 50% opacity
  const box2 = new UIView();
  box2.frame = new CGRect(40, 200, 120, 80);
  box2.backgroundColor = 'rgb(255 59 48 / 50%)';
  page.view.addSubview(box2);

  // 3. Semantic color: the color of body text, follows light and dark mode
  const box3 = new UIView();
  box3.frame = new CGRect(40, 300, 120, 80);
  box3.backgroundColor = 'label';
  page.view.addSubview(box3);

  // 4. Two colors of your own: green in light mode, blue in dark mode
  const box4 = new UIView();
  box4.frame = new CGRect(40, 400, 120, 80);
  box4.backgroundColor = 'light-dark(#34c759, #0a84ff)';
  page.view.addSubview(box4);

  // 5. Reading returns the string that was written
  console.log(box1.backgroundColor);
  console.log(box4.backgroundColor);
});
```

**Effect**

- The page has four 120 × 80 pt color blocks from top to bottom. pt is the iOS unit of length; see [Units](../api/units.md).
- The first block is indigo, the same in light and dark mode.
- The second block is translucent red, showing the page background through it. In light mode the page background is white, so the block looks light red. In dark mode the page background is black, so the block looks dark red.
- The third block is black in light mode and white in dark mode.
- The fourth block is green in light mode and blue in dark mode.
- When switching between light and dark mode in system settings, the page background and the third and fourth blocks change color automatically. No code is needed.
- The console logs `#5856D6` and `light-dark(#34c759, #0a84ff)`.

This code has not been run as a whole in the simulator. "Reading returns the string that was written" is verified in the acceptance tests. The actual colors of the blocks on screen and the changes when switching modes are **not verified in the simulator**.

To switch between light and dark mode in the simulator: menu Features → Toggle Appearance.

The examples below reuse `page`, `box1`, and `box2` from here. They all use `backgroundColor`; other properties that accept colors are written the same way. See [Properties that accept colors](../api/ui-color.md#properties-that-accept-colors) for the list.

To try a section on its own, write these lines first:

```js
const page = new UIViewController();
const box1 = new UIView();
box1.frame = new CGRect(40, 100, 120, 80);
page.view.addSubview(box1);
const box2 = new UIView();
box2.frame = new CGRect(40, 200, 120, 80);
page.view.addSubview(box2);
```

## Writing a fixed color

Use hex or `rgb()`. Both give the same color.

```js
box1.backgroundColor = '#ff9500';
box2.backgroundColor = 'rgb(255, 149, 0)';
```

**Effect**: both blocks turn orange, the same in light and dark mode. The colors on screen are **not verified in the simulator**.

The three numbers in `rgb()` are red, green, and blue, in the range 0–255. Hex letters can be upper or lower case; `'#FF9500'` and `'#ff9500'` are the same color.

You can also use a fixed color name from the table. Color names are case-sensitive; write them exactly as in the table:

```js
box1.backgroundColor = 'white';
```

**Effect**: the block turns white. **Not verified in the simulator.**

## Adding transparency

For hex, append a pair of digits for opacity: `00` is fully transparent and `ff` is opaque. For `rgb()`, add a fourth number in the range 0–1, or a percentage.

```js
box1.backgroundColor = '#ff000080';          // the trailing 80 is about 50%
box2.backgroundColor = 'rgba(255, 0, 0, 0.5)';
```

**Effect**: both blocks turn translucent red, showing what is behind them. **Not verified in the simulator.**

The space-separated `rgb()` syntax puts the opacity after `/`:

```js
box2.backgroundColor = 'rgb(255 0 0 / 50%)';
```

**Effect**: the same as above. **Not verified in the simulator.**

For full transparency, use the color name `clear` or assign `null`; see [Removing a color](#removing-a-color).

A color's opacity affects only that color. To make a whole view transparent together with its subviews, use the view's `alpha`; see [`UIView`](../api/ui-view.md).

> **Note:** Only hex and `rgb()` can carry transparency. Adding transparency to a color name (a translucent `systemBlue`, for example) is not currently possible.

## Following light and dark mode: semantic colors

iOS has two appearances, light and dark, chosen by the user in system settings. Semantic colors are a set of colors preconfigured by the system, named by purpose, each with a value for both appearances.

```js
page.view.backgroundColor = 'systemBackground';   // page background
box1.backgroundColor = 'secondarySystemBackground';   // a layer on top of the page background
box2.backgroundColor = 'separator';   // separator lines
```

**Effect**: the page background is white in light mode and black in dark mode. In each mode, the two blocks show the color the system configured for their purpose. Colors change automatically when the user switches modes. **Not verified in the simulator.**

Choose names by purpose, not by color value. For all semantic colors and their purposes, see [Available color names](../api/ui-color.md#color-names-you-can-use).

## Following light and dark mode: two colors of your own

Use `light-dark(light-mode color, dark-mode color)`.

```js
box1.backgroundColor = 'light-dark(#ffffff, #1c1c1e)';
box2.backgroundColor = 'light-dark(systemBackground, #000)';
```

**Effect**: `box1` is white in light mode and dark gray in dark mode. `box2` is the system page background in light mode and black in dark mode. Colors change automatically when the user switches modes. **The colors on screen are not verified in the simulator.**

Both arguments can use any of the string syntaxes on this page. It takes effect as soon as you write it; you do not need to declare separately that the app supports dark mode.

## Using colors from an Asset Catalog

An Asset Catalog is the resource directory for images and colors in an Xcode project. Add a Color Set (a named color) to it, and you can refer to it by name. A Color Set can have separate values for light, dark, and high contrast.

The example below assumes a Color Set named `BrandBlue` has been added to the Asset Catalog.

```js
box1.backgroundColor = 'asset(BrandBlue)';
```

**Effect**: the block shows the color configured for `BrandBlue` in the current appearance. **Not verified in the simulator.**

This is the only syntax that lets a color change under the Increase Contrast setting too. `light-dark()` distinguishes only light and dark.

> **Note:** A name that does not exist throws `TypeError` rather than just logging a warning; see [`asset()` throws when the name does not exist](../api/ui-color.md#asset-throws-when-the-name-doesnt-exist). Make sure the name exists before using it.

## Reading a color

What you read back is also a string. A validly written string is returned unchanged, never rewritten into another syntax.

```js
box1.backgroundColor = '#f00';
console.log(box1.backgroundColor);

box1.backgroundColor = 'rgba(255,0,0,.5)';
console.log(box1.backgroundColor);
```

**Effect**: the console logs `#f00` and then `rgba(255,0,0,.5)`. Case and spacing are the same as when written.

Any string you read back can be assigned again.

In two cases what you read back is not the string that was written; see [The string you read back](../api/ui-color.md#strings-you-read-back).

## Comparing two colors

Compare the strings you read back directly.

```js
box1.backgroundColor = '#5856D6';
box2.backgroundColor = '#5856D6';
console.log(box1.backgroundColor === box2.backgroundColor);
```

**Effect**: the console logs `true`.

This compares the **spelling**, not the color value. The same color written once as a color name and once in hex reads back as two different strings. There is currently no way to compare two colors by value.

## Removing a color

```js
box1.backgroundColor = null;
console.log(box1.backgroundColor);
```

**Effect**: the block becomes transparent, showing what is behind it. The console logs `null`. The change on screen is **not verified in the simulator**.

Writing `undefined` is the same as writing `null`. For some properties, writing `null` means restoring the default, such as [`textColor`](../api/ui-label/textcolor.md) of [`UILabel`](../api/ui-label.md); see each property's own page.

## Making layer colors follow light and dark mode

Colors on a layer (`view.layer`) are fixed when written and do not change with the appearance afterward. To follow it, write them again in the view's `traitchange` event:

```js
box1.layer.borderWidth = 1;
box1.layer.borderColor = 'separator';

box1.addEventListener('traitchange', () => {
  box1.layer.borderColor = 'separator';
});
```

**Effect**: the block has a 1 pt border. After the user switches between light and dark mode, the border changes to the separator color for the new appearance. **This code is not verified in the simulator**; the acceptance tests verify that "writing a layer color after `traitchange` reads back the value for the new appearance".

For why, see [Light mode and dark mode](../api/ui-color.md#light-mode-and-dark-mode). For more approaches, see [Supporting Dark Mode](dark-mode.md).

## See also

- [`UIColor`](../api/ui-color.md): supported syntaxes, available color names, warnings for invalid values, the string you read back
- [Supporting Dark Mode](dark-mode.md): reading the current appearance, forcing light or dark, making layer colors follow the appearance
- [`UIView`](../api/ui-view.md): where `backgroundColor` is
- [`CALayer`](../api/ca-layer.md): border and shadow colors
