---
type: reference
native: UIImage
status: partial
---

# `UIImage`

**`UIImage`** 表示一张图片。它不是视图，自己不会出现在屏幕上：把它赋给 [`UIImageView`](ui-image-view.md) 的 `image` 属性，图片才显示出来。按钮的图标、图层的内容、富文本里的附件也接受 `UIImage`。

图片对象通过静态方法从四个来源取得：App 包里的文件、系统自带的图标、设备上的文件、内存里的字节。**取不到时这四个方法都返回 `null`，不抛异常。**

`UIImage` 不可变：属性全部只读，改渲染模式、做九宫格的方法都返回一张新图，原图不变。同一个图片对象可以同时赋给多个图片视图。`UIImage` 不派发任何事件，它的属性不会变，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → `UIImage`

怎么显示打包的图、网络图片、动图，见指南[显示图片](../guides/images.md)。

## 构造函数

不能用 `new` 创建。`new UIImage()` 抛：

```
TypeError: Illegal constructor: UIImage is created by the runtime, not by new
```

图片对象通过下面四个静态方法得到。

## 静态方法

| 方法 | 图片从哪里来 | 什么时候用 |
| --- | --- | --- |
| [`UIImage.imageNamed()`](ui-image/imagenamed.md) | App 包里的图片 | 随 App 一起打包的图。默认用这个 |
| [`UIImage.systemImageNamed()`](ui-image/systemimagenamed.md) | SF Symbols | 图标。不增加 App 的体积 |
| [`UIImage.imageWithContentsOfFile()`](ui-image/imagewithcontentsoffile.md) | 指定路径的文件 | 保存在本地文件里的图 |
| [`UIImage.imageWithData()`](ui-image/imagewithdata.md) | `Blob` 里的字节 | 从网络下载的图 |

SF Symbols 是 iOS 自带的图标库，有上千个图标，按名字取，不需要自己准备图片文件。

## 实例属性

还继承 `NSObject` 的属性。全部只读，给它们赋值抛 `TypeError`。

| 属性 | 说明 |
| --- | --- |
| [`size`](ui-image/size.md) <small>只读</small> | 图片的宽和高，单位是点，不是像素 |
| [`scale`](ui-image/scale.md) <small>只读</small> | 一个点对应几个像素 |
| [`imageOrientation`](ui-image/imageorientation.md) <small>只读</small> | 图片存储时的方向标记 |
| [`isSymbolImage`](ui-image/issymbolimage.md) <small>只读</small> | 是不是 SF Symbols 图标 |
| [`renderingMode`](ui-image/renderingmode.md) <small>只读</small> | 显示时用不用图片自身的颜色 |
| [`capInsets`](ui-image/capinsets.md) <small>只读</small> | 九宫格里四条边保留的宽度 |
| [`resizingMode`](ui-image/resizingmode.md) <small>只读</small> | 九宫格里中间部分怎么填充 |
| [`alignmentRectInsets`](ui-image/alignmentrectinsets.md) <small>只读</small> | Auto Layout 对齐时从四边扣除的宽度 |
| [`duration`](ui-image/duration.md) <small>只读</small> | 动图播放一遍的时长 |
| [`images`](ui-image/images.md) <small>只读</small> | 动图的每一帧 |
| [`frameDurations`](ui-image/framedurations.md) <small>只读</small> | 动图每一帧显示的时长 |
| [`loopCount`](ui-image/loopcount.md) <small>只读</small> | 动图一共播放几遍 |

## 实例方法

还继承 `NSObject` 的方法。

返回新图的方法，原图不变：

| 方法 | 说明 |
| --- | --- |
| [`resizableImage()`](ui-image/resizableimage.md) | 生成一张九宫格图：四条边保留，中间可伸缩 |
| [`imageWithRenderingMode()`](ui-image/imagewithrenderingmode.md) | 生成一张渲染模式不同的图 |

在后台解码的方法，返回 Promise：

| 方法 | 说明 |
| --- | --- |
| [`prepareForDisplay()`](ui-image/preparefordisplay.md) | 解码成一张可以直接显示的图 |
| [`prepareThumbnail()`](ui-image/preparethumbnail.md) | 解码成一张缩小的图 |

## 随 App 打包的图片放在哪

图片文件放在项目根目录的 `assets/` 里。构建时这个目录被放进 App 包的 `JS/assets/`，所以取图时的名字要带上这段路径：`assets/logo.png` 对应 `UIImage.imageNamed('JS/assets/logo')`。扩展名可以不写。

同一张图可以准备三个文件：`logo.png`、`logo@2x.png`、`logo@3x.png`，分别给一个点对应 1、2、3 个像素的屏幕使用。取图时只写 `'JS/assets/logo'`，不写 `@2x`、`@3x`，系统按当前屏幕选择对应的文件。只准备其中一个文件时，其他屏幕上的显示效果**未在模拟器验证**。

查找规则的细节见 [`imageNamed()`](ui-image/imagenamed.md)。

## `size` 的单位是点，不是像素

`size` 和视图的 `frame` 用同一种单位：[点（pt）](units.md)。一个点对应几个像素由 `scale` 给出。

三个文件 `dot.png`（10 像素）、`dot@2x.png`（20 像素）、`dot@3x.png`（30 像素）读出来的 `size` 都是 10 × 10。像素数等于 `size` 乘以 `scale`。计算布局时用 `size`，不用像素数。

## 支持的图片格式

系统能解码 58 种格式，包括：

```
public.png   public.jpeg   com.compuserve.gif   public.tiff
org.webmproject.webp        public.heic / heif   public.avif
public.jpeg-xl              com.microsoft.bmp    com.microsoft.ico
```

多帧的 GIF、APNG、WebP 文件得到的是动图，见[动图](#动图)。其他格式的多帧文件（HEIC 序列、动画 AVIF）得到的是静态图，显示第一帧，**未在模拟器验证**。

**SVG 不能显示。** 把 SVG 的字节交给 `imageWithData()` 得到 `null`。SVG 可以放进 Asset Catalog，它在编译时被转成位图。

## 渲染模式和 `tintColor`

图片的 [`renderingMode`](ui-image/renderingmode.md) 决定显示时用不用图片自身的颜色：

| `renderingMode` | 效果 |
| --- | --- |
| `'automatic'` | 由使用图片的地方决定。新取到的图片都是这个值 |
| `'alwaysOriginal'` | 始终显示图片自身的颜色，`tintColor` 不起作用 |
| `'alwaysTemplate'` | 始终当作模板图：忽略图片自身的颜色，只用它的形状，整张按 `tintColor` 上色 |

模板图是只使用形状、不使用自身颜色的图片：图片里不透明的部分全部显示成 `tintColor`。SF Symbols 图标的 `renderingMode` 实测是 `'automatic'`，不是 `'alwaysTemplate'`。它在图片视图里按 `tintColor` 上色，是由显示它的地方决定的，不是图片上记录的。

`tintColor` 是图片视图的属性，见 [`UIImageView`](ui-image-view.md)。

## 大图和网络图片

图片对象取到时还没有解码成像素。解码发生在图片第一次显示的时候，和界面更新在同一个线程上进行。[`prepareForDisplay()`](ui-image/preparefordisplay.md) 把解码放到后台进行，完成后返回一张已经解码的图片。解码一张大图需要多长时间，本文档没有实测数据。

显示尺寸远小于原图时（比如列表里的头像），用 [`prepareThumbnail()`](ui-image/preparethumbnail.md) 取一张缩小的图。

运行时不提供图片缓存。`UIImage.imageWithData()` 每次都从字节生成一个新的图片对象，同一个地址再次 `fetch` 是否使用系统的 HTTP 缓存**未在模拟器验证**。缓存的做法见指南[显示图片](../guides/images.md)。

## 动图

动图是一个文件里存了多帧画面的图片。文件里还写着每一帧显示多久、一共播放几遍。能识别的动图格式有三种：GIF、APNG（扩展名是 `.png`）、动画 WebP。

**动图的取法和用法与普通图片完全相同。** 用四个静态方法取到它，赋给图片视图的 `image`，它就开始播放，不需要调用任何方法。播放的规则见 [`UIImageView`](ui-image-view.md#动图的播放)。

- 判断一张图是不是动图：[`images`](ui-image/images.md) 不是 `null`。
- 动图本身是一张静态图（第一帧）加上帧的信息。**只有图片视图会播放。** 把它用在按钮、标签栏等其他地方时显示第一帧。
- [`resizableImage()`](ui-image/resizableimage.md)、[`imageWithRenderingMode()`](ui-image/imagewithrenderingmode.md)、[`prepareThumbnail()`](ui-image/preparethumbnail.md) 对动图调用，得到的是静态图，内容是第一帧。[`prepareForDisplay()`](ui-image/preparefordisplay.md) 是例外，它返回的仍然是动图。

### 动图占多少内存

动图的每一帧都要解码成像素，播放期间一直占着内存。占用的字节数是「宽 × 高 × 4 × 帧数」，宽和高的单位是像素。一张 240 × 240 像素、12 帧的动图占 2.64 MB。一张 600 × 600 像素、300 帧的动图占 412 MB。

**解码后超过 64 MB 的动图不播放，只显示第一帧。** 这时 `images` 是 `null`，Xcode 的控制台里有一行以 `[nacre] animated image not played` 开头的输出。这个上限按单张图计算，同时显示多张动图时各算各的。

不先 `prepareForDisplay()` 时，所有帧在第一次显示时解码，和界面更新在同一个线程上。模拟器上实测，一张 12 帧、240 × 240 像素的 GIF 解码全部帧用了 72 毫秒。

## 示例

### 屏幕正中的图标

从空白 App 开始，在屏幕正中显示一个粉色的星形图标。

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

**效果**

- 屏幕正中出现一个粉色的实心五角星，位于 120 × 120 pt 的区域内，没有变形。
- 控制台输出 `true`。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

### 读图片的尺寸和倍率

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  console.log(dot.size.width, dot.size.height);
  console.log(dot.scale);
  console.log(dot.size.width * dot.scale);
}
```

**效果**：项目 `assets/` 里有 `dot.png`、`dot@2x.png`、`dot@3x.png` 时，在 @3x 屏幕的设备上，控制台依次输出 `10 10`、`3`、`30`。

更多写法见指南[显示图片](../guides/images.md)。

## 对应的 iOS API

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
| `img.images`、`img.duration` | `img.images`、`img.duration` |
| `[UIImage animatedImageWithImages:frames duration:1]` | 没有。动图用 `imageNamed()` 等方法直接从文件得到 |
| ImageIO 的 `kCGImagePropertyGIFDelayTime`、`kCGImagePropertyGIFLoopCount` 等 | `img.frameDurations`、`img.loopCount` |
| `img.symbolImage` | `img.isSymbolImage` |

- ObjC 里的 `NSData` 在 JS 里是 `Blob`。
- ObjC 里用 completion handler 返回结果的方法，在 JS 里返回 Promise。
- 多段的方法名，第一段是 JS 的方法名，其余各段是 `options` 对象的键。
- 原生的 `+imageNamed:`、`+imageWithData:` 遇到动图文件只给第一帧，`images` 是 `nil`。这里得到的是动图。

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 播放解码后超过 64 MB 的动图 | ImageIO 逐帧解码（`CGAnimateImageDataWithBlock`）。只显示第一帧 |
| 播放 HEIC 序列、动画 AVIF | ImageIO。得到的是静态图 |
| 在运行时显示 SVG 文件 | 系统不支持。SVG 只能放进 Asset Catalog，在编译时转成位图 |
| 自己画一张图、把几张图合成一张、把视图截成图 | `UIGraphicsImageRenderer` |
| 把图片编码成 PNG 或 JPEG 的字节 | `UIImagePNGRepresentation`、`UIImageJPEGRepresentation` |
| 调整 SF Symbols 图标的粗细、大小，使用多色图标 | `UIImageSymbolConfiguration`。图标的大小目前靠图片视图的大小和 `contentMode` 控制 |
| 深色模式下自动换一张图 | Asset Catalog 的外观变体。命令行工具生成的工程里做不到。替代做法是监听 `traitchange` 事件，在回调里换图，见指南[适配深色模式](../guides/dark-mode.md) |
| 运行时提供图片缓存 | 没有对应的原生能力。做法见指南[显示图片](../guides/images.md) |

## 参见

- [显示图片](../guides/images.md)：打包的图、系统图标、网络图片、动图、九宫格、缩略图
- [`UIImageView`](ui-image-view.md)：显示图片的视图
- [`UIButton`](ui-button.md)：按钮上的图标和背景图
- [`CALayer`](ca-layer.md)：图层的 `contents` 接受图片
- [`NSTextAttachment`](ns-text-attachment.md)：在文字里插一张图片
- [`fetch`](fetch.md)：下载图片，`Blob` 的说明
- [文件读写](filesystem.md)：把图片保存成文件，取得文件路径
- [结构体](structs.md)：`CGSize`、`UIEdgeInsets`
- [单位](units.md)：pt 是什么
- [实现原理：图片](../internals/ui-image.md)
