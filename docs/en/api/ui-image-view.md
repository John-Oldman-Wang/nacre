---
type: reference
native: UIImageView
status: partial
---

# `UIImageView`

**`UIImageView`** represents a view that displays an image, called an image view. Assign a [`UIImage`](ui-image.md) to its [`image`](ui-image-view/image.md) property and the image appears; an animated image plays automatically.

An image view doesn't load images on its own. Showing an image takes two steps: first get an image object with one of `UIImage`'s static methods, then assign it to the image view.

How the image is placed (stretched, scaled proportionally, cropped) is determined by `contentMode` and `clipsToBounds`, inherited from [`UIView`](ui-view.md). See [Does the image get distorted?](#does-the-image-get-distorted).

`UIImageView` doesn't fire any events of its own. Its properties are changed only by the app's code, so there are no change notifications.

**Inheritance**: `EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIImageView`

For showing bundled images, images from the network, and animated images, see the guide [Displaying images](../guides/images.md).

## Constructor

[`UIImageView()`](ui-image-view/constructor.md)

Creates an image view with no image and a width and height of 0.

## Instance properties

Also inherits properties from [`UIView`](ui-view.md). Inherited properties commonly used with image views are `contentMode`, `clipsToBounds`, `frame`, `backgroundColor`, and `layer`.

| Property | Description |
| --- | --- |
| [`image`](ui-image-view/image.md) | The image displayed |
| [`highlightedImage`](ui-image-view/highlightedimage.md) | The image displayed in the highlighted state |
| [`isHighlighted`](ui-image-view/ishighlighted.md) | Whether it is in the highlighted state |
| [`tintColor`](ui-image-view/tintcolor.md) | The color used to tint template images |
| [`isAnimating`](ui-image-view/isanimating.md) <small>read-only</small> | Whether a frame-by-frame animation set up with an array of images is playing |

## Instance methods

`UIImageView` declares no methods of its own. Also inherits methods from [`UIView`](ui-view.md).

## Does the image get distorted?

Yes. When the aspect ratio of the image differs from that of the image view, by default the image is stretched to fill the view and gets distorted. Placement is determined by the view's `contentMode` property:

| Desired result | How to write it |
| --- | --- |
| Show the whole image, undistorted, possibly leaving empty space in the view | `contentMode = 'scaleAspectFit'` |
| Fill the view, undistorted, cropping what overflows | `contentMode = 'scaleAspectFill'`, plus `clipsToBounds = true` |
| Fill the view, allowing distortion | The default value `'scaleToFill'` |

For example, a 100 × 100 pt image in a 300 × 200 pt view:

| `contentMode` | Result |
| --- | --- |
| `'scaleToFill'` (default) | The image is stretched to 300 × 200 pt, distorted |
| `'scaleAspectFit'` | The image is scaled proportionally to 200 × 200 pt, leaving 50 pt empty on the left and right |
| `'scaleAspectFill'` | The image is scaled proportionally to 300 × 300 pt, overflowing by 50 pt at the top and bottom |
| `'center'` | The image isn't scaled; it is shown at 100 × 100 pt in the center of the view |

The sizes in the table are calculated from the definition of each value; how they appear on screen is **not verified in the simulator**. For all 13 values of `contentMode`, see [`UIView`](ui-view.md).

> **Note:** `contentMode` only determines how the image is placed; it doesn't crop. When using `'scaleAspectFill'` without setting `clipsToBounds = true`, the part that overflows the view is drawn outside it and covers neighboring content.

## Image view size

An image view has an intrinsic size equal to the image's [`size`](ui-image/size.md). How you position it determines whether you need to give a width and height:

| Positioning | With no width and height given |
| --- | --- |
| [Auto Layout](auto-layout.md) constraints | The view is the same size as the image (verified by the acceptance tests) |
| Writing `frame` directly | The view's width and height are 0, and the image isn't visible |

Once both width and height are determined by constraints, the image size no longer affects the view's size.

## Playing animated images

When [`image`](ui-image-view/image.md) is an animated image (a multi-frame GIF, APNG, or WebP), the image view plays it automatically; no method call is needed.

- **The duration of each frame and the number of loops follow what the file specifies.** A file that says to loop forever plays forever. A file that says to play twice stops on the last frame after two loops.
- **Switching to another image stops it.** Assigning a static image or `null` to `image` stops playback.
- **Removing the image view from its superview and adding it back doesn't require reassigning.** The acceptance tests check that the animation used for playback is still there 0.4 seconds after removal. Whether playback continues on screen after it is added back is **not verified in the simulator**.
- **Frames are switched by the system and don't occupy the thread JS runs on.** This is the same as [layer animations](ca-animation.md). Whether an animated image keeps playing while JS runs for a long time is **not verified in the simulator**.
- During playback, the image view's layer has a [keyframe animation](ca-animation.md) named `'nacreImageFrames'`, which can be read with `iv.layer.animationForKey('nacreImageFrames')`. After an animated image with a finite number of loops finishes, this animation is still on the layer.
- Playback isn't reflected in [`isAnimating`](ui-image-view/isanimating.md).
- An animated image in an image view can't be paused, and there's no notification when it finishes. If you need these, hand the frames to a layer and play them yourself; see the guide [Displaying images](../guides/images.md).

## Examples

### Showing an image bundled with the app

Starting from a blank app, show the `dot` image from the project's `assets/` in the center of the screen, 120 pt wide and tall, undistorted.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const iv = new UIImageView();
  iv.image = UIImage.imageNamed('JS/assets/dot');
  iv.contentMode = 'scaleAspectFit';

  iv.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(iv);
  NSLayoutConstraint.activateConstraints([
    iv.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    iv.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    iv.widthAnchor.constraintEqualToConstant(120),
    iv.heightAnchor.constraintEqualToConstant(120),
  ]);
});
```

**Effect**: the `dot` image appears in a 120 × 120 pt area in the center of the screen, scaled up while keeping its aspect ratio. If the project has no such image, `image` is `null`; nothing is shown and no error is thrown. **This code is not verified in the simulator.**

For more approaches, see the guide [Displaying images](../guides/images.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[[UIImageView alloc] init]` | `new UIImageView()` |
| `iv.image = img` | `iv.image = img` |
| `iv.highlighted = YES` | `iv.isHighlighted = true` |
| `iv.tintColor = UIColor.systemPinkColor` | `iv.tintColor = 'systemPink'` |
| `iv.contentMode = UIViewContentModeScaleAspectFill` | `iv.contentMode = 'scaleAspectFill'` |

### Comparison with the browser

| HTML / CSS | Here |
| --- | --- |
| `<img>` | `UIImageView` |
| `<img>` plays animated GIF, APNG, and WebP images automatically | Same. An animated image plays automatically once assigned to `image` |
| `src` attribute; the element loads the image itself | None. Get a `UIImage` first, then assign it to `image`; download images from the network with `fetch` |
| `srcset` lists files for multiple pixel densities | Name files `name@2x.png`, `name@3x.png`, and the system chooses automatically |
| `object-fit: fill` | `contentMode = 'scaleToFill'` (the default value) |
| `object-fit: contain` | `contentMode = 'scaleAspectFit'` |
| `object-fit: cover` | `contentMode = 'scaleAspectFill'` plus `clipsToBounds = true` |
| `object-fit: none` | `contentMode = 'center'` |
| SVG icons colored with `currentColor` | Template images plus `tintColor` |
| The browser caches images automatically | The runtime doesn't provide an image cache |

## See also

- [Displaying images](../guides/images.md)
- [`UIImage`](ui-image.md): where image objects come from
- [`UIView`](ui-view.md): inherited members such as `contentMode`, `clipsToBounds`, position, and size
- [`UIButton`](ui-button.md): switches images automatically while a finger is pressed on it
- [`UIColor`](ui-color.md): which values `tintColor` accepts
- [Auto Layout](auto-layout.md): positioning image views with constraints
