---
type: reference
native: "-[UIProgressView init]"
---

# `UIProgressView()` constructor

The **`UIProgressView()`** constructor creates a progress bar. A new progress bar has a width of 0; give it a width to make it visible.

## Syntax

```
new UIProgressView()
```

### Parameters

None.

### Return value

A new `UIProgressView`:

- [`progressViewStyle`](progressviewstyle.md) is `'default'`.
- [`progress`](progress.md) is 0; the filled portion has length 0, and the screen shows only a light background track.
- The four appearance properties [`progressTintColor`](progresstintcolor.md), [`trackTintColor`](tracktintcolor.md), [`progressImage`](progressimage.md), and [`trackImage`](trackimage.md) are all `null`.
- `frame` is 0 wide and 4 [pt](../units.md) tall. `isHidden` is `false`.

When positioning with Auto Layout, constrain its left and right edges or its width; the height doesn't need a constraint. When positioning with `frame`, write `frame` to give the position and width.

### Exceptions

**`TypeError`**

Subclassing this class and calling `new`: `class X extends UIProgressView {}` throws at `new X()`; see [Native classes](../native-classes.md).

## Examples

```js
const bar = new UIProgressView();
console.log(bar.frame.width, bar.frame.height, bar.progress);
```

**Result**: Prints `0 4 0`.

## Corresponding iOS API

`-[UIProgressView init]`. `initWithProgressViewStyle:` has no corresponding constructor parameter; write `progressViewStyle` after creating it. A progress bar created with `initWithProgressViewStyle:` is 160 pt wide; one created here is 0 wide.

## See also

- [The height is determined by the style](../ui-progress-view.md#the-height-is-determined-by-the-style)
