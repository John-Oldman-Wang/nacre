# 显示图片

这一篇讲怎么用 [`UIImage`](../api/ui-image.md) 和 [`UIImageView`](../api/ui-image-view.md) 显示图片：打包在 App 里的图、系统图标、网络图片、本地文件里的图、动图，以及图片怎么摆、怎么上色、怎么拉伸。每个方法和属性的细节在这两个类的参考页。

## 推荐的做法

- **显示一张图分两步：先取图，再赋给图片视图。** 图片视图不会自己加载图片。取图的四个方法取不到时都返回 `null`，不抛异常，所以取图之后先判空。
- **图片作为普通文件放在项目的 `assets/` 里**，用 `UIImage.imageNamed('JS/assets/名字')` 取。命令行工具生成的工程没有往 Asset Catalog 里添加图片的途径。
- **每个图片视图都明确写 `contentMode`**：照片、封面用 `'scaleAspectFill'` 加 `clipsToBounds = true`，图标用 `'scaleAspectFit'`。默认的 `'scaleToFill'` 会把图片拉伸变形。
- **用约束给图片视图确定大小**（固定的宽高，或者固定的宽度加宽高比），不依赖图片的尺寸。网络图片在下载完成之前没有尺寸，不这样做时视图的大小会在图片到达时变化。
- **从网络下载的图片都先 [`prepareForDisplay()`](../api/ui-image/preparefordisplay.md) 再显示**，把解码放到后台。动图也一样。小图标不需要。

## 第一个图片

从空白 App 开始，在屏幕正中显示一个粉色的星形图标。图标来自 SF Symbols：iOS 自带的图标库，有上千个图标，按名字取，不需要自己准备图片文件。

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
});
```

**效果**：屏幕正中出现一个粉色的实心五角星，位于 120 × 120 pt 的区域内，没有变形。

这段代码没有作为一个整体在模拟器运行过。其中用到的每个 API 都在验收用例里运行过。

五步分别是：取图、创建视图并赋图、定摆法、上色、放到页面上。下面的每种用法都是在这五步上改，沿用这里的 `page` 和 `iv`。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const iv = new UIImageView();
page.view.addSubview(iv);
```

## 显示打包在 App 里的图

图片文件放在项目根目录的 `assets/` 里，构建时被放进 App 包的 `JS/assets/`。

```js
const dot = UIImage.imageNamed('JS/assets/dot');
if (dot) {
  iv.image = dot;
  console.log(dot.size.width, dot.size.height, dot.scale);
}
```

**效果**

- 图片视图显示项目 `assets/` 目录里的 `dot` 图片。
- 控制台输出 `10 10 3`（在 @3x 屏幕的设备上）。

名字可以不写扩展名。`imageNamed()` 不会到子目录里搜索，图片在 `JS/assets/` 里时只写 `'dot'` 找不到。目录里有 `dot.png`、`dot@2x.png`、`dot@3x.png` 三个文件时，系统按屏幕选其中一个。完整的规则见 [`imageNamed()`](../api/ui-image/imagenamed.md)。

## 显示系统图标

```js
iv.image = UIImage.systemImageNamed('heart.fill');
iv.contentMode = 'scaleAspectFit';
```

**效果**：图片视图显示一个实心的心形图标，颜色是图片视图的 `tintColor`。**未在模拟器验证。**

全部图标名可以在 Apple 提供的 SF Symbols 应用里查。名字不存在时返回 `null`。

## 给图标上色

```js
iv.image = UIImage.systemImageNamed('star.fill');
iv.tintColor = '#FF3B30';
console.log(iv.tintColor);
```

**效果**

- 星形显示为红色。**未在模拟器验证。**
- 控制台输出 `#FF3B30`。写入的颜色字符串原样读回。

`tintColor` 只对模板图起作用：图片里不透明的部分全部显示成 `tintColor`。SF Symbols 的图标在图片视图里按模板图处理。自己的图片默认显示原来的颜色，要让它也按 `tintColor` 上色，先转成模板图：

```js
const mark = UIImage.imageNamed('JS/assets/dot');
if (mark) {
  iv.image = mark.imageWithRenderingMode('alwaysTemplate');
  iv.tintColor = 'systemGreen';
}
```

**效果**：图片里不透明的部分全部显示为绿色，原来的颜色不显示。**未在模拟器验证。**

规则见[渲染模式和 `tintColor`](../api/ui-image.md#渲染模式和-tintcolor)。

## 显示从网络下载的图

```js
async function showRemoteImage() {
  const res = await fetch('https://picsum.photos/200/200');
  const blob = await res.blob();

  const img = UIImage.imageWithData(blob);
  if (img === null) {
    console.log('下载到的不是图片');
    return;
  }

  // 在后台解码，解完再显示
  const ready = await img.prepareForDisplay();
  iv.image = ready ?? img;
  console.log(img.size.width, img.size.height, img.scale);
}

showRemoteImage();
```

**效果**

- 下载完成后，图片视图显示这张图。
- 控制台输出 `200 200 1`。

这是显示网络图片的标准写法。三步分别是：用 [`fetch`](../api/fetch.md) 下载并取得 `Blob`，用 [`imageWithData()`](../api/ui-image/imagewithdata.md) 把 `Blob` 变成图片，用 `prepareForDisplay()` 在后台解码。

- 下载要用 `res.blob()`，不要用 `res.arrayBuffer()`：`imageWithData()` 只接受 `Blob`。
- 下载到的内容不是图片时（比如服务器返回了一个错误页面），`imageWithData()` 返回 `null`，不抛异常。网络不通时 `fetch` 会拒绝，要用 `try…catch` 处理，见 [`fetch`](../api/fetch.md)。
- `prepareForDisplay()` 的结果可能是 `null`，这时退回使用原图。
- 下载期间图片视图是空的。可以先给它设一个 `backgroundColor` 占位。
- `imageWithData()` 得到的图片 `scale` 是 1：200 × 200 像素的图，`size` 是 200 × 200 pt，在 @3x 屏幕上会被放大显示。要按 @2x 或 @3x 的图处理，传 `{ scale }`。
- 下载到的是动图时写法不变：`prepareForDisplay()` 会把所有帧都解码，赋给 `image` 之后自动播放。

## 缓存下载过的图

运行时不提供图片缓存。`imageWithData()` 每次都从字节生成一个新的图片对象。需要缓存时有两种做法：

- 在 App 运行期间重复使用：把取到的 `UIImage` 对象保存在一个 `Map` 里，按地址查找。
- 下次启动仍然可用：把下载到的内容写进缓存目录，以后从文件读取，见下一节。

## 显示保存在本地文件里的图

图片先保存成文件，以后从文件读取。文件的读写见[文件读写](../api/filesystem.md)。

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

[`imageWithContentsOfFile()`](../api/ui-image/imagewithcontentsoffile.md) 的参数是完整的绝对路径。文件不存在或不是图片时返回 `null`。

## 显示动图

假设项目的 `assets/` 目录里有一个 `anim.gif`，4 帧，每帧 0.1 秒，一直循环。

```js
const loading = UIImage.imageNamed('JS/assets/anim.gif');
if (loading !== null) {
  iv.image = loading;
  console.log(loading.images === null ? 0 : loading.images.length);
  console.log(loading.duration.toFixed(1), loading.loopCount);
}
```

**效果**

- 图片视图里的图开始播放，一直循环。
- 控制台输出 `4`，然后输出 `0.4 Infinity`：4 帧，播放一遍 0.4 秒，一直循环。

取动图时名字要带扩展名：`imageNamed()` 在名字不带扩展名时只找 `.png` 文件。APNG 的扩展名是 `.png`，可以不写。

播放的规则见[动图的播放](../api/ui-image-view.md#动图的播放)。表情、加载指示这类小动图直接赋给图片视图；解码后超过 64 MB 的动图只显示第一帧，见[动图占多少内存](../api/ui-image.md#动图占多少内存)。

## 让动图停下

`loading` 是上一节读进来的那张动图，第一行重新读一次：

```js
const loading = UIImage.imageNamed('JS/assets/anim.gif');
const frames = loading === null ? null : loading.images;
if (frames !== null) {
  iv.image = frames[0];
}
```

**效果**：播放停止，图片视图显示第一帧。

`images` 里的每一帧都是一张静态图，可以单独显示。要显示最后一帧，用 `frames[frames.length - 1]`。再把 `loading` 赋回 `image`，动图从头开始播放。

## 自己控制动图的播放

图片视图上的动图不能暂停，播完了也没有通知。需要这些时，不用图片视图，把帧交给一个[图层](../api/ca-layer.md)，用[关键帧动画](../api/ca-animation.md)播放。`loading` 是[播放动图](#显示动图)那一节读进来的动图，第一行重新读一次：

```js
const loading = UIImage.imageNamed('JS/assets/anim.gif');
const allFrames = loading === null ? null : loading.images;
const durations = loading === null ? null : loading.frameDurations;
if (loading !== null && allFrames !== null && durations !== null) {
  // 1. 一个图层，内容先设成最后一帧：动画播完后显示的是它
  const layer = new CALayer();
  layer.frame = new CGRect(20, 80, 48, 48);
  layer.contents = allFrames[allFrames.length - 1];
  page.view.layer.addSublayer(layer);

  // 2. 每一帧开始的时刻，写成占总时长的比例。个数比帧数多一个，最后一个是 1
  const keyTimes = [];
  let elapsed = 0;
  for (const seconds of durations) {
    keyTimes.push(elapsed / loading.duration);
    elapsed += seconds;
  }
  keyTimes.push(1);

  // 3. 关键帧动画：依次显示每一帧，帧与帧之间不过渡
  const play = CAKeyframeAnimation.animationWithKeyPath('contents');
  play.values = allFrames;
  play.keyTimes = keyTimes;
  play.calculationMode = 'discrete';
  play.duration = loading.duration;
  play.repeatCount = 2;
  play.addEventListener('stop', (event) => {
    console.log('播完了', event.finished);
  });
  layer.addAnimation(play, { forKey: 'play' });
}
```

**效果**

- 页面左上方出现一个 48 × 48 pt 的图层，把动图播放 2 遍，然后停在最后一帧。
- 播完时控制台输出 `播完了 true`。

**这段代码没有作为一个整体在模拟器运行过。** 验收用例检查了其中的每一步都不报错、动画挂在了图层上，没有等它播完。

- `repeatCount` 换成 `loading.loopCount`，遍数就和文件里写的一致。`loopCount` 是 `Infinity` 时一直循环。
- 中途停下用 `layer.removeAnimationForKey('play')`，这时 `stop` 事件的 `finished` 是 `false`。
- 用一组单独的图片做逐帧动画也这样写，把那组图片作为 `values`。

## 图片和视图比例不一致时怎么摆

```js
iv.contentMode = 'scaleAspectFill';
iv.clipsToBounds = true;
```

**效果**：图片保持宽高比放大或缩小，直到盖满整个视图。超出视图的部分不显示。**未在模拟器验证。**

各个 `contentMode` 的结果见[图片会不会变形](../api/ui-image-view.md#图片会不会变形)。

> **注意**：`contentMode` 只决定图片怎么摆，不负责裁剪。用 `'scaleAspectFill'` 时不设 `clipsToBounds = true`，超出的部分会显示在视图外面，盖住旁边的内容。

## 让视图的高度跟着图片的比例走

不想让图片变形，也不想留空或裁剪，就让视图的宽高比和图片一致。

```js
const photo = UIImage.imageNamed('JS/assets/dot');
if (photo) {
  iv.image = photo;
  const width = 200;
  const height = width * (photo.size.height / photo.size.width);
  iv.frame = new CGRect(20, 100, width, height);
}
```

**效果**：图片视图宽 200 pt，高度按图片的宽高比算出。图片刚好填满视图，不变形。**未在模拟器验证。**

## 用约束给图片视图定大小

这是图片视图配合约束的推荐写法：位置和宽度用约束确定，高度按固定的宽高比跟着宽度走，再用 `contentMode` 处理图片和视图比例不一致的情况。

```js
const cover = new UIImageView();
cover.contentMode = 'scaleAspectFill';
cover.clipsToBounds = true;
cover.backgroundColor = 'secondarySystemBackground';   // 图片到达之前的占位底色
cover.translatesAutoresizingMaskIntoConstraints = false;
page.view.addSubview(cover);

const safe = page.view.safeAreaLayoutGuide;
NSLayoutConstraint.activateConstraints([
  cover.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 16 }),
  cover.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  cover.trailingAnchor.constraintEqualToAnchor(safe.trailingAnchor, { constant: -16 }),
  // 高度 = 宽度 × 9/16
  cover.heightAnchor.constraintEqualToAnchor(cover.widthAnchor, { multiplier: 9 / 16 }),
]);
```

**效果**：页面顶部出现一块宽高比 16:9 的灰色区域，左右各离屏幕边缘 16 pt。之后把任何比例的图片赋给 `cover.image`，图片都填满这块区域，不变形，超出的部分不显示，视图的大小不变。**这段代码未在模拟器验证。**

宽和高都被约束确定之后，图片的尺寸不再影响视图的大小。网络图片到达前后，页面上其他内容的位置不变。

只约束位置、不约束宽高时，视图的大小等于图片的 `size`。这种写法适合尺寸已知的小图标。

## 做可拉伸的背景图（九宫格）

气泡、带圆角的边框这类背景图，需要拉伸到任意大小而四个角不变形。做法是指定四条边各留多宽不参与拉伸，只拉伸中间的部分。这种做法叫九宫格。

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

> **注意**：不写 `resizingMode` 时，中间的部分是重复平铺（`'tile'`），不是拉伸。中间是纯色时两种方式看起来一样，有渐变或图案时不一样。

## 按下态换一张图

图片视图可以存两张图：平常显示 `image`，`isHighlighted` 为 `true` 时显示 `highlightedImage`。

```js
iv.image = UIImage.systemImageNamed('star');
iv.highlightedImage = UIImage.systemImageNamed('star.fill');

iv.isHighlighted = true;
```

**效果**：`isHighlighted` 设成 `true` 后，图片视图从空心星形换成实心星形。设回 `false` 换回空心星形。**换图的效果未在模拟器验证。**

系统不会自动改 `isHighlighted`。需要「手指按住时自动换图」时，用 [`UIButton`](../api/ui-button.md) 的 `setImage()` 给 `highlighted` 状态单独设一张图。

## 清除图片

```js
iv.image = null;
```

**效果**：图片视图不再显示图片，只剩底色（如果设了 `backgroundColor`）。**未在模拟器验证。**

## 生成缩略图

显示尺寸远小于原图时（比如列表里的头像），取一张缩小的图来显示。

```js
async function showThumbnail() {
  const big = UIImage.imageNamed('JS/assets/dot');
  if (big === null) return;

  const thumbnail = await big.prepareThumbnail(new CGSize(5, 5));
  if (thumbnail) {
    iv.image = thumbnail;
  }
}

showThumbnail();
```

**效果**：图片视图显示一张缩小过的图。缩略图在后台生成。**缩略图的实际尺寸未在模拟器验证。**

## 深色模式下换一张图

命令行工具生成的工程里做不到「深色模式下自动换图」。做法是监听 `traitchange` 事件，在回调里换图，见[适配深色模式](dark-mode.md)。

## 参见

- [`UIImage`](../api/ui-image.md)：取图的方法、图片的属性、动图
- [`UIImageView`](../api/ui-image-view.md)：显示图片的视图，摆法和播放
- [`fetch`](../api/fetch.md)：下载图片
- [文件读写](../api/filesystem.md)：把图片保存成文件
- [`CALayer`](../api/ca-layer.md)、[图层动画](../api/ca-animation.md)：自己播放动图
