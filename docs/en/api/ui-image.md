---
type: reference
native: UIImage
status: partial
---

# `UIImage`

**`UIImage`** represents an image. It isn't a view and doesn't appear on screen by itself: the image is displayed once you assign it to the `image` property of a [`UIImageView`](ui-image-view.md). Button icons, layer contents, and attachments in attributed strings also accept a `UIImage`.

Image objects come from static methods that read from four sources: files in the app bundle, the system's built-in icons, files on the device, and bytes in memory. **When an image can't be obtained, all four methods return `null` rather than throwing.**

`UIImage` is immutable: all its properties are read-only, and the methods that change the rendering mode or make a nine-slice image return a new image, leaving the original unchanged. The same image object can be assigned to several image views at once. `UIImage` doesn't fire any events; its properties never change, so there are no change notifications.

**Inheritance**: `EventTarget` → `NSObject` → `UIImage`

For how to display bundled images, network images, and animated images, see the guide [Displaying images](../guides/images.md).

## Constructor

It can't be created with `new`. `new UIImage()` throws:

```
TypeError: Illegal constructor: UIImage is created by the runtime, not by new
```

Image objects come from the four static methods below.

## Static methods

| Method | Where the image comes from | When to use it |
| --- | --- | --- |
| [`UIImage.imageNamed()`](ui-image/imagenamed.md) | An image in the app bundle | Images bundled with the app. Use this by default |
| [`UIImage.systemImageNamed()`](ui-image/systemimagenamed.md) | SF Symbols | Icons. Doesn't add to the app's size |
| [`UIImage.imageWithContentsOfFile()`](ui-image/imagewithcontentsoffile.md) | A file at a given path | Images saved in local files |
| [`UIImage.imageWithData()`](ui-image/imagewithdata.md) | Bytes in a `Blob` | Images downloaded from the network |

SF Symbols is the icon library built into iOS. It has thousands of icons that you get by name, without preparing image files yourself.

## Instance properties

Also inherits the properties of `NSObject`. All are read-only; assigning to them throws `TypeError`.

| Property | Description |
| --- | --- |
| [`size`](ui-image/size.md) <small>read-only</small> | The image's width and height, in points, not pixels |
| [`scale`](ui-image/scale.md) <small>read-only</small> | How many pixels correspond to one point |
| [`imageOrientation`](ui-image/imageorientation.md) <small>read-only</small> | The orientation tag stored with the image |
| [`isSymbolImage`](ui-image/issymbolimage.md) <small>read-only</small> | Whether it is an SF Symbols icon |
| [`renderingMode`](ui-image/renderingmode.md) <small>read-only</small> | Whether the image's own colors are used when displayed |
| [`capInsets`](ui-image/capinsets.md) <small>read-only</small> | The widths kept on the four edges of a nine-slice image |
| [`resizingMode`](ui-image/resizingmode.md) <small>read-only</small> | How the middle of a nine-slice image is filled |
| [`alignmentRectInsets`](ui-image/alignmentrectinsets.md) <small>read-only</small> | The widths subtracted from the four edges for Auto Layout alignment |
| [`duration`](ui-image/duration.md) <small>read-only</small> | How long one loop of an animated image takes |
| [`images`](ui-image/images.md) <small>read-only</small> | Each frame of an animated image |
| [`frameDurations`](ui-image/framedurations.md) <small>read-only</small> | How long each frame of an animated image is shown |
| [`loopCount`](ui-image/loopcount.md) <small>read-only</small> | How many times an animated image plays in total |

## Instance methods

Also inherits the methods of `NSObject`.

Methods that return a new image, leaving the original unchanged:

| Method | Description |
| --- | --- |
| [`resizableImage()`](ui-image/resizableimage.md) | Makes a nine-slice image: the four edges are kept, and the middle stretches |
| [`imageWithRenderingMode()`](ui-image/imagewithrenderingmode.md) | Makes an image with a different rendering mode |

Methods that decode in the background and return a Promise:

| Method | Description |
| --- | --- |
| [`prepareForDisplay()`](ui-image/preparefordisplay.md) | Decodes into an image ready to display directly |
| [`prepareThumbnail()`](ui-image/preparethumbnail.md) | Decodes into a scaled-down image |

## Where bundled images go

Put image files in `assets/` at the project root. At build time this directory is placed in `JS/assets/` in the app bundle, so the name you use to get an image includes that path: `assets/logo.png` corresponds to `UIImage.imageNamed('JS/assets/logo')`. The extension can be omitted.

You can prepare three files for the same image: `logo.png`, `logo@2x.png`, and `logo@3x.png`, for screens where one point is 1, 2, and 3 pixels respectively. When getting the image, write just `'JS/assets/logo'`, without `@2x` or `@3x`; the system picks the file for the current screen. How it looks on other screens when only one of the files is provided is **not verified in the simulator**.

For the details of the lookup rules, see [`imageNamed()`](ui-image/imagenamed.md).

## `size` is in points, not pixels

`size` uses the same unit as a view's `frame`: [points (pt)](units.md). How many pixels one point corresponds to is given by `scale`.

The three files `dot.png` (10 pixels), `dot@2x.png` (20 pixels), and `dot@3x.png` (30 pixels) all read a `size` of 10 × 10. The pixel count equals `size` times `scale`. Use `size` for layout calculations, not the pixel count.

## Supported image formats

The system can decode 58 formats, including:

```
public.png   public.jpeg   com.compuserve.gif   public.tiff
org.webmproject.webp        public.heic / heif   public.avif
public.jpeg-xl              com.microsoft.bmp    com.microsoft.ico
```

Multi-frame GIF, APNG, and WebP files give animated images; see [Animated images](#animated-images). Multi-frame files in other formats (HEIC sequences, animated AVIF) give static images showing the first frame (**not verified in the simulator**).

**SVG can't be displayed.** Passing SVG bytes to `imageWithData()` gives `null`. SVG can go into an Asset Catalog, where it is converted to a bitmap at compile time.

## Rendering mode and `tintColor`

An image's [`renderingMode`](ui-image/renderingmode.md) decides whether its own colors are used when it is displayed:

| `renderingMode` | Effect |
| --- | --- |
| `'automatic'` | Decided by where the image is used. Every newly obtained image has this value |
| `'alwaysOriginal'` | Always shows the image's own colors; `tintColor` has no effect |
| `'alwaysTemplate'` | Always treated as a template image: the image's own colors are ignored, only its shape is used, and the whole image is colored with `tintColor` |

A template image uses only its shape, not its own colors: every non-transparent part of the image is shown in `tintColor`. The `renderingMode` of SF Symbols icons is `'automatic'` (measured), not `'alwaysTemplate'`. That they are colored with `tintColor` in an image view is decided by where they are displayed, not recorded on the image.

`tintColor` is a property of the image view; see [`UIImageView`](ui-image-view.md).

## Large images and network images

An image object isn't decoded into pixels when you get it. Decoding happens the first time the image is displayed, on the same thread as interface updates. [`prepareForDisplay()`](ui-image/preparefordisplay.md) moves decoding to the background and returns an already decoded image when done. This documentation has no measured data on how long decoding a large image takes.

When the display size is much smaller than the original (such as avatars in a list), use [`prepareThumbnail()`](ui-image/preparethumbnail.md) to get a scaled-down image.

`UIImage.imageWithData()` creates a new image object from the bytes every time; cache it yourself if you want to reuse it. Whether fetching the same URL again uses the system's HTTP cache is **not verified in the simulator**. For caching patterns, see the guide [Displaying images](../guides/images.md).

## Animated images

An animated image stores multiple frames in one file. The file also records how long each frame is shown and how many times to play in total. Three animated formats are recognized: GIF, APNG (with a `.png` extension), and animated WebP.

**Animated images are obtained and used exactly like ordinary images.** Get one with the four static methods, assign it to an image view's `image`, and it starts playing, with no method to call. For the playback rules, see [`UIImageView`](ui-image-view.md#playing-animated-images).

- To tell whether an image is animated: [`images`](ui-image/images.md) isn't `null`.
- An animated image is itself a static image (the first frame) plus the frame information. **Only image views play it.** Used anywhere else, such as on a button or a tab bar, it shows the first frame.
- Calling [`resizableImage()`](ui-image/resizableimage.md), [`imageWithRenderingMode()`](ui-image/imagewithrenderingmode.md), or [`prepareThumbnail()`](ui-image/preparethumbnail.md) on an animated image gives a static image of the first frame. [`prepareForDisplay()`](ui-image/preparefordisplay.md) is the exception: it still returns an animated image.

### How much memory animated images use

Every frame of an animated image is decoded into pixels and stays in memory throughout playback. The bytes used are "width × height × 4 × frame count", with width and height in pixels. A 240 × 240 pixel animated image with 12 frames uses 2.64 MB. A 600 × 600 pixel animated image with 300 frames uses 412 MB.

**An animated image that exceeds 64 MB after decoding doesn't play; only its first frame is shown.** In that case `images` is `null`, and Xcode's console has a line starting with `[nacre] animated image not played`. The limit applies per image; when several animated images are shown at once, each counts separately.

Without calling `prepareForDisplay()` first, all frames are decoded the first time the image is displayed, on the same thread as interface updates. Measured in the simulator, decoding all frames of a 12-frame, 240 × 240 pixel GIF took 72 milliseconds.

## Examples

### An icon in the center of the screen

Starting from a blank app, display a pink star icon in the center of the screen.

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const star = UIImage.systemImageNamed('star.fill');

  const iv = new UIImageView();
  iv.image = star;
  iv.contentMode = 'scaleAspectFit';
  iv.tintColor = 'systemPink';

  iv.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(iv);
  NSLayoutConstraint.activateConstraints([
    iv.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    iv.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
    iv.widthAnchor.constraintEqualToConstant(120),
    iv.heightAnchor.constraintEqualToConstant(120),
  ]);

  if (star) {
    console.log(star.isSymbolImage);
  }
});
```

**Effect**

- A solid pink five-pointed star appears in the center of the screen, within a 120 × 120 pt area, undistorted.
- The console prints `true`.

This code hasn't been run as a whole in the simulator. Every API it uses has been run in the acceptance tests.

### Reading an image's size and scale

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  console.log(dot.size.width, dot.size.height);
  console.log(dot.scale);
  console.log(dot.size.width * dot.scale);
}
```

**Effect**: When the project's `assets/` has `dot.png`, `dot@2x.png`, and `dot@3x.png`, on a device with a @3x screen the console prints `10 10`, `3`, then `30`.

For more patterns, see the guide [Displaying images](../guides/images.md).

## Corresponding iOS API

| ObjC | JS |
| --- | --- |
| `[UIImage imageNamed:@"logo"]` | `UIImage.imageNamed('logo')` |
| `[UIImage systemImageNamed:@"star.fill"]` | `UIImage.systemImageNamed('star.fill')` |
| `[UIImage imageWithContentsOfFile:path]` | `UIImage.imageWithContentsOfFile(path)` |
| `[UIImage imageWithData:data]` | `UIImage.imageWithData(blob)` |
| `[UIImage imageWithData:data scale:2]` | `UIImage.imageWithData(blob, { scale: 2 })` |
| `[img resizableImageWithCapInsets:insets]` | `img.resizableImage({ withCapInsets: insets })` |
| `[img resizableImageWithCapInsets:insets resizingMode:UIImageResizingModeStretch]` | `img.resizableImage({ withCapInsets: insets, resizingMode: 'stretch' })` |
| `[img imageWithRenderingMode:UIImageRenderingModeAlwaysTemplate]` | `img.imageWithRenderingMode('alwaysTemplate')` |
| `[img prepareForDisplayWithCompletionHandler:^(UIImage* r){}]` | `await img.prepareForDisplay()` |
| `[img prepareThumbnailOfSize:size completionHandler:…]` | `await img.prepareThumbnail(size)` |
| `img.images`, `img.duration` | `img.images`, `img.duration` |
| `[UIImage animatedImageWithImages:frames duration:1]` | None. Animated images come directly from files through `imageNamed()` and the other methods |
| ImageIO's `kCGImagePropertyGIFDelayTime`, `kCGImagePropertyGIFLoopCount`, and so on | `img.frameDurations`, `img.loopCount` |
| `img.symbolImage` | `img.isSymbolImage` |

- ObjC's `NSData` is a `Blob` in JS.
- ObjC methods that return results through a completion handler return a Promise in JS.
- For multi-part method names, the first part is the JS method name, and the remaining parts are keys of the `options` object.
- The native `+imageNamed:` and `+imageWithData:` give only the first frame of an animated image file, with `images` as `nil`. Here you get an animated image.

## See also

- [Displaying images](../guides/images.md): bundled images, system icons, network images, animated images, nine-slice images, thumbnails
- [`UIImageView`](ui-image-view.md): the view that displays images
- [`UIButton`](ui-button.md): icons and background images on buttons
- [`CALayer`](ca-layer.md): a layer's `contents` accepts images
- [`NSTextAttachment`](ns-text-attachment.md): inserting an image into text
- [`fetch`](fetch.md): downloading images, and an explanation of `Blob`
- [File system](filesystem.md): saving images to files and getting file paths
- [Structs](structs.md): `CGSize`, `UIEdgeInsets`
- [Units](units.md): what pt is
