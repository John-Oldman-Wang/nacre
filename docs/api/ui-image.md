---
type: reference
native: UIImage
status: partial
---

# `UIImage` / `UIImageView`

显示图片要用两个类：

- `UIImage` 是图片对象：一张已经取到的图。它不是视图，自己不会出现在屏幕上。
- `UIImageView` 是显示图片的视图。把 `UIImage` 赋给它的 `image` 属性，图片就显示出来。

`UIImageView` 相当于 HTML 的 `<img>`，有四点不同：

- **没有 `src`。** 不能把地址交给视图让它自己加载。要先用 `UIImage` 的类方法取到图片对象，再赋给 `image`。网络图片要自己用 [`fetch`](fetch.md) 下载。
- **图片和视图大小不一致时的摆法由 `contentMode` 决定。** 它相当于 CSS 的 `object-fit`。默认值是拉伸变形，相当于 `object-fit: fill`。
- **超出视图的部分默认不裁剪。** CSS 的 `object-fit: cover` 自带裁剪，这里要另外设 `clipsToBounds = true`。
- **图片尺寸的单位是点（pt），不是像素。** 见 [`size` 的单位是点](#size-的单位是点不是像素)。

这一页分三部分：先给一个[能直接运行的完整例子](#完整例子)，再按[你想做的事](#常见用法)给出写法和效果，最后是[每个成员的说明](#成员说明)。

## 完整例子

下面的代码从空白 App 开始，在屏幕正中显示一个粉色的星形图标。图标来自 SF Symbols。SF Symbols 是 iOS 自带的图标库，有上千个图标，按名字取，不需要自己准备图片文件。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 取一张图。'star.fill' 是 SF Symbols 里的图标名
  const star = UIImage.systemImageNamed('star.fill');

  // 2. 创建图片视图，把图交给它
  const iv = new UIImageView();
  iv.image = star;

  // 3. 图片比视图小：保持宽高比放大到刚好放进视图
  iv.contentMode = 'scaleAspectFit';

  // 4. 给图标上色
  iv.tintColor = 'systemPink';

  // 5. 放到页面上：位置在正中，宽高各 120 pt
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

五步分别是：取图、创建视图并赋图、定摆法、上色、放到页面上。后面的每种用法都是在这五步上改。

## 常见用法

以下例子都假设已经有上面的 `page` 和 `iv`。

### 显示打包在 App 里的图

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  iv.image = dot;
  console.log(dot.size.width, dot.size.height, dot.scale);
}
```

**效果**

- 图片视图显示 `JS/assets/` 目录下的 `dot` 图片。
- 控制台输出 `10 10 3`（在 @3x 屏幕的设备上）。

名字是图片在 App 包里的路径，从包的根目录算起，可以不写扩展名。`imageNamed()` 不会到子目录里搜索，图片在 `JS/assets/` 里时只写 `'dot'` 找不到。

目录里有 `dot.png`、`dot@2x.png`、`dot@3x.png` 三个文件时，系统按屏幕选其中一个。这相当于 `<img>` 的 `srcset`，差别是不用自己列出来，只要文件名按这个规则命名。

找不到图片时返回 `null`，不抛错，所以要先判空。完整的规则见 [`imageNamed` 的查找规则](#imagenamed-的查找规则实测)。

### 显示系统图标

```js
iv.image = UIImage.systemImageNamed('heart.fill');
iv.contentMode = 'scaleAspectFit';
```

**效果**：图片视图显示一个实心的心形图标，颜色是图片视图的 `tintColor`。**未在模拟器验证。**

图标名来自 SF Symbols。全部图标名可以在 Apple 提供的 SF Symbols 应用里查。名字不存在时返回 `null`。

### 给图标上色

```js
iv.image = UIImage.systemImageNamed('star.fill');
iv.tintColor = '#FF3B30';
console.log(iv.tintColor);
```

**效果**

- 星形显示为红色。**未在模拟器验证。**
- 控制台输出 `#FF3B30`。写入的颜色字符串原样读回。

`tintColor` 只对模板图起作用。模板图是只使用形状、不使用自身颜色的图片，相当于用 `currentColor` 上色的 SVG。SF Symbols 的图标在图片视图里按模板图处理。

自己的图片默认显示原来的颜色。要让它也按 `tintColor` 上色，先转成模板图：

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  iv.image = dot.imageWithRenderingMode('alwaysTemplate');
  iv.tintColor = 'systemGreen';
}
```

**效果**：图片里不透明的部分全部显示为绿色，原来的颜色不显示。**未在模拟器验证。**

颜色的写法见[颜色](ui-color.md)。模板图的规则见[渲染模式和 `tintColor`](#渲染模式和-tintcolor)。

### 显示从网络下载的图

```js
async function showRemoteImage() {
  const res = await fetch('https://picsum.photos/200/200');
  const blob = await res.blob();

  const img = UIImage.imageWithData(blob);
  if (img === null) {
    console.log('下载到的不是图片');
    return;
  }

  // 在后台线程解码，解完再显示
  const ready = await img.prepareForDisplay();
  iv.image = ready ?? img;
  console.log(img.size.width, img.size.height, img.scale);
}

showRemoteImage();
```

**效果**

- 下载完成后，图片视图显示这张图。
- 控制台输出 `200 200 1`。

三步分别是：用 [`fetch`](fetch.md) 下载并取得 `Blob`，用 `imageWithData()` 把 `Blob` 变成图片，用 `prepareForDisplay()` 在后台解码。

图片的字节一直保存在原生一侧。JS 只持有 `Blob` 和 `UIImage` 两个对象，几 MB 的图片不会占用 JS 的堆内存。

`imageWithData()` 得到的图片 `scale` 是 1：200 × 200 像素的图，`size` 是 200 × 200 pt。在 @3x 屏幕上它会被放大显示。要按 @2x 或 @3x 的图处理，传 `scale`，见 [`UIImage.imageWithData()`](#uiimageimagewithdata)。

为什么要 `prepareForDisplay()`，见[解码发生在第一次显示时](#解码发生在第一次显示时)。

### 显示保存在本地文件里的图

图片先保存成文件，以后从文件读取。文件的读写见[文件读写](filesystem.md)。

```js
async function showCachedImage() {
  const fs = application.fileSystem;
  const path = fs.caches + '/cover.jpg';

  if (!(await fs.exists(path))) {
    const res = await fetch('https://picsum.photos/200/200');
    await fs.writeBytes(path, await res.blob());
  }

  const img = UIImage.imageWithContentsOfFile(path);
  if (img) {
    iv.image = img;
  }
}

showCachedImage();
```

**效果**：第一次运行时下载图片并保存到缓存目录，然后显示。以后运行时直接从文件读取并显示，不再下载。**这个例子未在模拟器验证。**

`imageWithContentsOfFile()` 的参数是完整的绝对路径。文件不存在或不是图片时返回 `null`。

### 图片和视图比例不一致时怎么摆

用 `contentMode` 选摆法。它是 [`UIView`](ui-view.md) 的属性，相当于 CSS 的 `object-fit`。

```js
iv.contentMode = 'scaleAspectFill';
iv.clipsToBounds = true;
```

**效果**：图片保持宽高比放大或缩小，直到盖满整个视图。超出视图的部分不显示。**未在模拟器验证。**

以 100 × 100 pt 的图片放进 300 × 200 pt 的视图为例：

| `contentMode` | 相当于 CSS | 结果 |
| --- | --- | --- |
| `'scaleToFill'`（默认） | `object-fit: fill` | 图片拉伸成 300 × 200 pt，变形 |
| `'scaleAspectFit'` | `object-fit: contain` | 图片等比放大到 200 × 200 pt，左右各空出 50 pt |
| `'scaleAspectFill'` | `object-fit: cover` | 图片等比放大到 300 × 300 pt，上下各超出 50 pt |
| `'center'` | `object-fit: none` | 图片不缩放，按 100 × 100 pt 显示在视图正中 |

> **注意**：`contentMode` 只决定图片怎么摆，不负责裁剪。用 `'scaleAspectFill'` 时如果不设 `clipsToBounds = true`，超出的部分会显示在视图外面，盖住旁边的内容。

`contentMode` 的全部 13 个取值见 [`UIView`](ui-view.md) 的成员说明。

### 让视图的高度跟着图片的比例走

不想让图片变形，也不想留空或裁剪，就让视图的宽高比和图片一致。

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  iv.image = dot;
  const width = 200;
  const height = width * (dot.size.height / dot.size.width);
  iv.frame = new CGRect(20, 100, width, height);
}
```

**效果**：图片视图宽 200 pt，高度按图片的宽高比算出。图片刚好填满视图，不变形。**未在模拟器验证。**

用 [Auto Layout](auto-layout.md) 时，图片视图的固有尺寸（`intrinsicContentSize`）等于图片的 `size`。不加宽高约束，视图就和图片一样大。

### 做可拉伸的背景图（九宫格）

气泡、带圆角的边框这类背景图，需要拉伸到任意大小而四个角不变形。做法是指定四条边各留多宽不参与拉伸，只拉伸中间的部分。这种做法叫九宫格，CSS 里最接近的是 `border-image` 的 `slice`。

```js
const frameImage = UIImage.imageNamed('JS/assets/frame');   // 20 × 20 pt 的圆角边框
if (frameImage) {
  iv.image = frameImage.resizableImage({
    withCapInsets: new UIEdgeInsets(6, 6, 6, 6),
    resizingMode: 'stretch',
  });
  iv.frame = new CGRect(20, 100, 280, 80);
}
```

**效果**：边框图铺满 280 × 80 pt 的视图。四个角保持原来的大小和形状，四条边只沿自己的方向拉伸，中间的 8 × 8 pt 拉伸填满剩下的区域。**未在模拟器验证。**

`withCapInsets` 的四个数依次是上、左、下、右四条边保留的宽度，单位是 pt。

> **注意**：不写 `resizingMode` 时，中间的部分是重复平铺（`'tile'`），不是拉伸。这一点是实测结果。中间是纯色时两种方式看起来一样，有渐变或图案时不一样。

`resizableImage()` 不修改原图，返回一张新图。

### 读图片的尺寸和倍率

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  console.log(dot.size.width, dot.size.height);   // 单位是 pt
  console.log(dot.scale);                         // 一个点对应几个像素
  console.log(dot.size.width * dot.scale);        // 像素宽度
}
```

**效果**：在 @3x 屏幕的设备上，控制台依次输出 `10 10`、`3`、`30`。

### 按下态换一张图

图片视图可以存两张图：平常显示 `image`，`isHighlighted` 为 `true` 时显示 `highlightedImage`。

```js
iv.image = UIImage.systemImageNamed('star');
iv.highlightedImage = UIImage.systemImageNamed('star.fill');

iv.isHighlighted = true;
```

**效果**：`isHighlighted` 设成 `true` 后，图片视图从空心星形换成实心星形。设回 `false` 换回空心星形。**换图的效果未在模拟器验证。**

`UIImageView` 不接收触摸，系统不会自动改 `isHighlighted`，要由你的代码来设。需要「手指按住时自动换图」时，用 [`UIButton`](ui-button.md) 的 `setImage()` 给 `highlighted` 状态单独设一张图。

### 清除图片

```js
iv.image = null;
```

**效果**：图片视图不再显示图片，只剩底色（如果设了 `backgroundColor`）。**未在模拟器验证。**

### 生成缩略图

列表里显示很小的头像时，不需要完整解码原图。

```js
async function showThumbnail() {
  const dot = UIImage.imageNamed('JS/assets/dot');
  if (dot === null) return;

  const thumbnail = await dot.prepareThumbnail(new CGSize(5, 5));
  if (thumbnail) {
    iv.image = thumbnail;
  }
}

showThumbnail();
```

**效果**：图片视图显示一张缩小过的图。缩略图在后台线程生成，不占用主线程。**缩略图的实际尺寸未在模拟器验证。**

## 概念

### 四种取图方式

四个类方法得到的都是 `UIImage`，用法相同：赋给 `imageView.image`。

| 方法 | 图片从哪里来 | 什么时候用 |
| --- | --- | --- |
| `UIImage.imageNamed(name)` | App 包里的图片 | 随 App 一起打包的图。默认用这个 |
| `UIImage.systemImageNamed(name)` | SF Symbols | 图标。不增加 App 的体积 |
| `UIImage.imageWithContentsOfFile(path)` | 指定路径的文件 | 保存在本地文件里的图 |
| `UIImage.imageWithData(blob)` | `Blob` 里的字节 | 从网络下载的图 |

四个方法都可能返回 `null`：名字不存在、文件读不到、字节不是图片。这种情况不抛错。只有参数类型不对、枚举值写错时才抛错。

### `size` 的单位是点，不是像素

`UIImage` 的 `size` 和视图的 `frame` 用同一种单位：[点（pt）](units.md)。一个点对应几个像素由 `scale` 给出。

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  console.log(dot.size.width);   // 10，单位 pt
  console.log(dot.scale);        // 3，表示系统选了 dot@3x.png
}
```

**效果**：在 @3x 屏幕的设备上输出 `10` 和 `3`。

三个文件 `dot.png`（10 像素）、`dot@2x.png`（20 像素）、`dot@3x.png`（30 像素）读出来的 `size` 都是 10 × 10。像素数等于 `size` 乘以 `scale`。

计算布局时用 `size`，不用像素数。

### `imageNamed` 的查找规则（实测）

```js
UIImage.imageNamed('logo');              // 能找到 App 包根目录下的 logo.png
UIImage.imageNamed('JS/assets/logo');    // 能找到子目录里的图，名字里写路径
UIImage.imageNamed('logo.png');          // 带扩展名也可以
```

- 不递归搜索子目录。图片在 `JS/assets/` 里，写 `'logo'` 找不到。
- `@2x`、`@3x` 的文件在子目录里也会被自动选中。
- 仓库里放在 `ios/JS/assets/` 的文件，在 App 包里的路径是 `JS/assets/`。

iOS 还有另一种存放图片的方式，叫 Asset Catalog。它是 Xcode 管理图片的资源库，编译后合并成一个 `Assets.car` 文件。`imageNamed()` 先查 Asset Catalog，再查 App 包里的文件。两边有同名图片时使用 Asset Catalog 里的。

两种存放方式的差别：

| | 放进 Asset Catalog | 作为普通文件 |
| --- | --- | --- |
| `imageNamed()` 能找到 | 是 | 是 |
| 自动选 `@2x` / `@3x` | 是 | 是 |
| 深色模式自动换图 | 是 | 否 |
| 按设备裁减安装包、按需下载 | 是 | 否 |
| 能得到文件路径和字节 | 否 | 是 |
| 支持 webp | 否，编译失败 | 是 |

- Asset Catalog 编译后不再有单独的图片文件。需要上传、计算哈希、交给别的 API 的图片不要放进去。
- webp 图片不能放进 Asset Catalog。放进去之后整个 Asset Catalog 都编译不出来。
- SVG 可以放进 Asset Catalog，它在编译时被转成位图。运行时不能解码 SVG：把 SVG 的字节交给 `imageWithData()` 得到 `null`。

### 支持的图片格式

系统能解码 58 种格式，包括：

```
public.png   public.jpeg   com.compuserve.gif   public.tiff
org.webmproject.webp        public.heic / heif   public.avif
public.jpeg-xl              com.microsoft.bmp    com.microsoft.ico
```

GIF 动图只能得到第一帧。实测一个 2 帧的 GIF，得到的 `UIImage` 是静态图，`duration` 是 0。

### `UIImage` 是不可变的

`UIImage` 的属性全部只读。改渲染模式、做九宫格的方法都返回一张新图，原图不变。

```js
const star = UIImage.systemImageNamed('star.fill');
if (star) {
  const original = star.imageWithRenderingMode('alwaysOriginal');
  console.log(original === star);        // false
  console.log(original.renderingMode);   // 'alwaysOriginal'
  console.log(star.renderingMode);       // 'automatic'
}
```

**效果**：控制台依次输出 `false`、`alwaysOriginal`、`automatic`。

同一张图可以同时赋给多个图片视图。

### 渲染模式和 `tintColor`

图片的 `renderingMode` 决定显示时用不用图片自身的颜色：

| `renderingMode` | 效果 |
| --- | --- |
| `'automatic'` | 由使用图片的地方决定。新取到的图片都是这个值 |
| `'alwaysOriginal'` | 始终显示图片自身的颜色，`tintColor` 不起作用 |
| `'alwaysTemplate'` | 始终当作模板图：忽略图片自身的颜色，只用它的形状，整张按 `tintColor` 上色 |

SF Symbols 图标的 `renderingMode` 实测是 `'automatic'`，不是 `'alwaysTemplate'`。它在图片视图里按 `tintColor` 上色，是由显示它的地方决定的，不是图片上记录的。

`tintColor` 是图片视图的属性。没有设过时，它的值是系统默认的强调色。

### 解码发生在第一次显示时

`imageWithData()`、`imageNamed()` 得到的图片还没有解码成像素。解码发生在图片第一次显示到屏幕上的时候，在主线程上进行。JS 也在主线程上运行，所以大图的解码会让界面卡顿一下。

`prepareForDisplay()` 把解码放到后台线程，完成后返回一张已经解码的新图：

```js
async function showDecoded() {
  const img = UIImage.imageNamed('JS/assets/dot');
  if (img === null) return;

  const ready = await img.prepareForDisplay();
  iv.image = ready ?? img;
}

showDecoded();
```

**效果**：图片显示出来，显示时主线程不再做解码。

小图标不需要这样做。从网络下载的大图建议都这样做。

### 图片视图的大小

- **用 Auto Layout 时可以不设宽高。** 图片视图的固有尺寸等于图片的 `size`。只约束位置，视图就和图片一样大。
- **用 `frame` 时必须自己给大小。** 新建的图片视图宽高是 0，不设大小什么都看不到。

## 成员说明

### `UIImage`

`UIImage` 继承自 `NSObject`。不能用 `new` 创建，只能通过下面四个类方法得到。

```js
// @ts-expect-error UIImage 的构造函数不公开
new UIImage();
```

**效果**：抛 `TypeError: Illegal constructor: UIImage is created by the runtime, not by new`。

#### `UIImage.imageNamed()`

按名字取 App 包里的图片。

```js
const logo = UIImage.imageNamed('JS/assets/dot');
```

- **参数** `name`：字符串。图片在 App 包里的路径，可以不带扩展名。规则见 [`imageNamed` 的查找规则](#imagenamed-的查找规则实测)。
- **返回**：`UIImage`。找不到时返回 `null`。
- **出错**：`name` 不是字符串时抛 `TypeError: imageNamed 需要一个字符串名字`。

#### `UIImage.systemImageNamed()`

按名字取 SF Symbols 里的图标。

```js
const star = UIImage.systemImageNamed('star.fill');
```

- **参数** `name`：字符串。SF Symbols 的图标名。
- **返回**：`UIImage`，它的 `isSymbolImage` 是 `true`。名字不存在时返回 `null`。
- **出错**：`name` 不是字符串时抛 `TypeError: systemImageNamed 需要一个字符串名字`。

#### `UIImage.imageWithContentsOfFile()`

从文件读取图片。

```js
const img = UIImage.imageWithContentsOfFile(application.fileSystem.caches + '/cover.jpg');
```

- **参数** `path`：字符串。文件的绝对路径。目录的路径从[文件读写](filesystem.md)取得。
- **返回**：`UIImage`。文件不存在或不是图片时返回 `null`。
- 只读取真实的文件，不查 Asset Catalog。
- **出错**：`path` 不是字符串时抛 `TypeError: imageWithContentsOfFile 需要一个字符串路径`。

#### `UIImage.imageWithData()`

把 `Blob` 里的字节解成图片。

```js
const bytes = new Uint8Array([
  137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 13, 73, 72, 68, 82, 0, 0, 0, 2,
  0, 0, 0, 2, 8, 6, 0, 0, 0, 114, 182, 13, 36, 0, 0, 0, 17, 73, 68, 65, 84,
  120, 218, 99, 248, 127, 144, 253, 63, 8, 51, 192, 24, 0, 101, 94, 11, 25,
  206, 178, 233, 129, 0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130,
]);
const blob = new Blob([bytes], { type: 'image/png' });   // 一张 2 × 2 像素的 PNG

const a = UIImage.imageWithData(blob);
const b = UIImage.imageWithData(blob, { scale: 2 });
if (a && b) {
  console.log(a.size.width, a.scale);   // 2 1
  console.log(b.size.width, b.scale);   // 1 2
}
```

**效果**：控制台输出 `2 1` 和 `1 2`。**第二行里的 `scale` 读回 `2` 未在模拟器验证，`size.width` 是 `1` 已验证。**

- **参数** `blob`：[`Blob`](fetch.md)。通常来自 `fetch` 的 `res.blob()`。
- **参数** `options.scale`：数，可选。图片的倍率，表示一个点对应几个像素。不传时是 1。传了之后 `size` 等于像素数除以 `scale`。值不大于 0 时按 1 处理。
- **返回**：`UIImage`。字节不是系统支持的图片格式时返回 `null`。
- **出错**：`blob` 不是 `Blob` 时抛 `TypeError: imageWithData 需要一个 Blob`。

#### 属性

全部只读。图片不可变，所以这些值不会变，没有变化通知。

| 属性 | 类型 | 可读 | 可写 | 含义 |
| --- | --- | --- | --- | --- |
| `size` | `CGSize` | 是 | 否 | 图片的宽和高，单位是 [pt](units.md)，不是像素。已经按 `imageOrientation` 转正 |
| `scale` | 数 | 是 | 否 | 倍率：一个点对应几个像素。没有单位。像素数等于 `size` 乘以 `scale` |
| `imageOrientation` | 字符串 | 是 | 否 | 图片存储时的方向标记，取值见下表 |
| `isSymbolImage` | 布尔 | 是 | 否 | `true`：这张图是 SF Symbols 图标。`false`：普通图片 |
| `renderingMode` | `'automatic'` \| `'alwaysOriginal'` \| `'alwaysTemplate'` | 是 | 否 | 显示时用不用图片自身的颜色。取值见[渲染模式和 `tintColor`](#渲染模式和-tintcolor) |
| `capInsets` | `UIEdgeInsets` | 是 | 否 | 九宫格里四条边保留的宽度，单位是 pt。没做过九宫格的图片四个值都是 0 |
| `resizingMode` | `'tile'` \| `'stretch'` | 是 | 否 | 九宫格里中间部分的填充方式。`'tile'`：重复平铺。`'stretch'`：拉伸 |
| `alignmentRectInsets` | `UIEdgeInsets` | 是 | 否 | Auto Layout 对齐时从图片四边各扣除的宽度，单位是 pt。用于图片四周带阴影等装饰的情况。**取值未在模拟器验证** |
| `duration` | 数 | 是 | 否 | 逐帧动画播放一轮的时长，单位是秒。静态图是 0 |

`imageOrientation` 的取值。相机拍的照片常常按横向存储，再用这个标记说明显示时怎么转正：

| 取值 | 含义 |
| --- | --- |
| `'up'` | 不需要旋转。验收用例里从 App 包取到的 PNG 是这个值 |
| `'down'` | 存储的像素旋转了 180° |
| `'left'` | 存储的像素逆时针旋转了 90° |
| `'right'` | 存储的像素顺时针旋转了 90° |
| `'upMirrored'`、`'downMirrored'`、`'leftMirrored'`、`'rightMirrored'` | 在对应方向的基础上再做一次镜像翻转 |

除 `'up'` 以外的取值**未在模拟器验证**。显示图片时系统自动按这个标记转正，一般不需要读它。

#### `resizableImage()`

生成一张九宫格图：四条边保留，中间可伸缩。

```js
const frameImage = UIImage.imageNamed('JS/assets/frame');
if (frameImage) {
  const a = frameImage.resizableImage({ withCapInsets: new UIEdgeInsets(6, 6, 6, 6) });
  const b = frameImage.resizableImage({
    withCapInsets: { top: 6, left: 6, bottom: 6, right: 6 },
    resizingMode: 'stretch',
  });
  console.log(a.capInsets.left, a.resizingMode);   // 6 'tile'
  console.log(b.resizingMode);                     // 'stretch'
}
```

**效果**：控制台输出 `6 tile` 和 `stretch`。

- **参数** `options.withCapInsets`：必填。`UIEdgeInsets` 对象，或者带 `top`、`left`、`bottom`、`right` 四个数的普通对象。四条边各保留多宽，单位是 pt。
- **参数** `options.resizingMode`：可选。`'tile'`：中间重复平铺。`'stretch'`：中间拉伸。不写时是 `'tile'`。
- **返回**：新的 `UIImage`。原图不变。
- **出错**：
  - 没传 `withCapInsets`：`TypeError: resizableImage needs { withCapInsets }`
  - `withCapInsets` 不是对象：`TypeError: withCapInsets needs an object with all of: top, left, bottom, right`
  - `withCapInsets` 缺字段或字段不是有限的数：`TypeError: withCapInsets is missing top, or it is not a finite number`，其中 `top` 换成出问题的那个字段名
  - `resizingMode` 写错：`TypeError: resizingMode has no value "fill"; expected one of: …`

#### `imageWithRenderingMode()`

生成一张渲染模式不同的图。

```js
const star = UIImage.systemImageNamed('star.fill');
if (star) {
  const template = star.imageWithRenderingMode('alwaysTemplate');
  console.log(template.renderingMode);
}
```

**效果**：控制台输出 `alwaysTemplate`。

- **参数** `mode`：`'automatic'`、`'alwaysOriginal'` 或 `'alwaysTemplate'`。含义见[渲染模式和 `tintColor`](#渲染模式和-tintcolor)。
- **返回**：新的 `UIImage`。原图不变。
- **出错**：`mode` 写错时抛 `TypeError: renderingMode has no value "template"; expected one of: …`。

#### `prepareForDisplay()` 和 `prepareThumbnail()`

在后台线程解码图片。两个方法都返回 Promise。

| 方法 | 参数 | Promise 的结果 |
| --- | --- | --- |
| `prepareForDisplay()` | 无 | 一张已经解码的 `UIImage`，尺寸和原图相同 |
| `prepareThumbnail(size)` | `size`：缩略图的目标尺寸，单位是 pt。`CGSize` 对象，或者带 `width`、`height` 的普通对象 | 一张已经解码的缩略图 |

```js
async function decode() {
  const dot = UIImage.imageNamed('JS/assets/dot');
  if (dot === null) return;

  const ready = await dot.prepareForDisplay();
  if (ready) {
    console.log(ready.size.width === dot.size.width);
  }
}

decode();
```

**效果**：控制台输出 `true`。

- **返回**：`Promise<UIImage | null>`。系统解码失败时结果是 `null`，所以使用前要判空。原图不变。
- **出错**：`prepareThumbnail()` 的 `size` 不是对象时抛 `TypeError: prepareThumbnail needs an object with all of: width, height`。缺字段时抛 `TypeError: prepareThumbnail is missing width, or it is not a finite number`。这两个错误是同步抛出的，不是 Promise 被拒绝。

### `UIImageView`

`UIImageView` 继承自 [`UIView`](ui-view.md)。位置、大小、层级、底色、透明度、`contentMode`、`clipsToBounds` 等都是 `UIView` 的成员，这里不重复。

`UIImageView` 自己不派发任何事件。

#### `new UIImageView()`

创建一个没有图片的图片视图。没有参数。

```js
const avatar = new UIImageView();
console.log(avatar.image);
```

**效果**：控制台输出 `null`。

新建的图片视图位置是 `(0, 0)`，宽高是 0。

#### 属性

| 属性 | 类型 | 可读 | 可写 | 默认值 | 含义 |
| --- | --- | --- | --- | --- | --- |
| `image` | `UIImage` 或 `null` | 是 | 是 | `null` | 显示的图片。`null` 表示不显示图片。读出来的和写进去的是同一个对象 |
| `highlightedImage` | `UIImage` 或 `null` | 是 | 是 | `null` | `isHighlighted` 为 `true` 时显示的图片。`null` 表示这时仍然显示 `image`。**`null` 时的显示效果未在模拟器验证** |
| `isHighlighted` | 布尔 | 是 | 是 | `false` | `true`：显示 `highlightedImage`。`false`：显示 `image`。系统不会自动改它 |
| `tintColor` | [颜色](ui-color.md)字符串 | 是 | 是 | 系统默认的强调色 | 模板图用这个颜色上色。写入时也接受 `UIColor` 对象。写 `null` 恢复成默认值。**默认值读出来的字符串未在模拟器验证** |
| `isAnimating` | 布尔 | 是 | 否 | `false` | `true`：正在播放逐帧动画。逐帧动画还不能用，所以它一直是 `false` |

- 这些属性变化时没有事件通知。它们只会被你自己的代码修改。
- `tintColor` 写入不合法的颜色时不抛错。控制台输出一条警告，比如 `[Nacre] tintColor: "#GGG" is not a valid color, ignored`，颜色保持原值。
- `tintColor` 读出来的是字符串。写入 `'systemPink'` 读回 `'systemPink'`。
- 其余通用的出错情况见 [`UIView`](ui-view.md) 的成员说明。

## 与 iOS 原生写法的对照

如果你在看 Apple 的文档或 iOS 的示例代码，按这张表换成 JS 的写法。

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
| `img.symbolImage` | `img.isSymbolImage` |
| `[[UIImageView alloc] init]` | `new UIImageView()` |
| `iv.image = img` | `iv.image = img` |
| `iv.highlighted = YES` | `iv.isHighlighted = true` |
| `iv.tintColor = UIColor.systemPinkColor` | `iv.tintColor = 'systemPink'` |
| `iv.contentMode = UIViewContentModeScaleAspectFill` | `iv.contentMode = 'scaleAspectFill'` |

- ObjC 里的 `NSData` 在 JS 里是 `Blob`。
- ObjC 里用 completion handler 返回结果的方法，在 JS 里返回 Promise。
- 多段的方法名，第一段是 JS 的方法名，其余各段是 `options` 对象的键。

## 还不能做的

| 想做的事 | 对应的原生能力 | 状态 |
| --- | --- | --- |
| 播放 GIF、APNG 动图 | ImageIO 逐帧解码，`UIImageView.animationImages` | 未实现。动图只能显示第一帧 |
| 在运行时显示 SVG 文件 | — | 系统不支持。SVG 只能放进 Asset Catalog，在编译时转成位图 |
| 自己画一张图、把几张图合成一张、把视图截成图 | `UIGraphicsImageRenderer` | 未实现 |
| 把图片编码成 PNG 或 JPEG 的字节 | `UIImagePNGRepresentation`、`UIImageJPEGRepresentation` | 未实现 |
| 调整 SF Symbols 图标的粗细、大小，使用多色图标 | `UIImageSymbolConfiguration` | 未实现。图标的大小目前靠图片视图的大小和 `contentMode` 控制 |
| 给图片视图以外的视图设 `tintColor`，让子视图继承 | `UIView.tintColor` | 未实现。`tintColor` 只在 `UIImageView` 上有 |
| 深色模式切换时收到通知，自己换图 | `UITraitCollection` | 未实现 |
| 读出屏幕是 @2x 还是 @3x | `UIScreen.scale` | 未实现。可以从 `imageNamed()` 取到的图片的 `scale` 间接得知 |

## 参见

- [`UIView`](ui-view.md)：`contentMode`、`clipsToBounds`、位置和大小等继承来的成员
- [`UIButton`](ui-button.md)：按钮上的图标和背景图，按状态设置
- [`fetch`](fetch.md)：下载图片，`Blob` 的说明
- [文件读写](filesystem.md)：把图片保存成文件，取得文件路径
- [颜色](ui-color.md)：`tintColor` 能写哪些值
- [结构体](structs.md)：`CGSize`、`UIEdgeInsets`
- [Auto Layout](auto-layout.md)：用约束定位图片视图
- [单位](units.md)：pt 是什么
- [实现原理：图片](../internals/ui-image.md)

← 返回 [API 文档](README.md)
