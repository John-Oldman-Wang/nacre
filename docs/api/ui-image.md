# `UIImage` / `UIImageView`

```js
const iv = new UIImageView();
iv.image = UIImage.imageNamed('JS/assets/logo');
iv.contentMode = 'scaleAspectFit';
iv.frame = new CGRect(20, 100, 200, 120);
view.addSubview(iv);
```

四条取图路径，**一个心智模型**：拿到一个 `UIImage`，赋给 `imageView.image`。

| | 从哪来 | 什么时候用 |
| --- | --- | --- |
| `UIImage.imageNamed(name)` | Asset Catalog + bundle 里的文件 | 打进 App 的图，默认选这条 |
| `UIImage.systemImageNamed(name)` | SF Symbols | 图标。上千个，不占包体积 |
| `UIImage.imageWithContentsOfFile(path)` | 完整路径的真实文件 | 下载到容器里的图 |
| `UIImage.imageWithData(blob)` | `Blob` 的字节 | HTTP 下来的图 |

**四条都可能返回 `null`**——名字不存在、文件读不到、字节解不出来。这是**合法答案不是错误**，所以不抛。会抛的只有「你问错了」：参数类型不对、枚举名不认识。

## `size` 是点，不是像素

这条最容易踩：

```js
const img = UIImage.imageNamed('JS/assets/dot');
img.size;     // CGSize(10, 10)   ← 点
img.scale;    // 3                ← 这台设备选了 @3x
// 真实像素 = 10 × 3 = 30
```

三个文件 `dot.png`(10px) / `dot@2x.png`(20px) / `dot@3x.png`(30px)，**读出来的 `size` 都是 10×10**。系统按屏幕挑哪一份，`scale` 告诉你挑了谁。

算布局要用 `size`，它和 `frame` 是同一套坐标。

## `imageNamed` 的查找规则（实测）

```js
UIImage.imageNamed('logo')              // bundle 顶层 ✓
UIImage.imageNamed('JS/assets/logo')    // 子目录 ✓  ← 认路径
UIImage.imageNamed('logo.png')          // 带扩展名 ✓
```

但**不会递归搜**：图在 `JS/assets/` 里，写 `'logo'` 是找不到的。

顺序是**先查 Asset Catalog，再查 bundle 文件**，同名时 Asset Catalog 赢。

### 两套资源的差别只在这几条

| | 进 Asset Catalog | 当普通文件 |
| --- | --- | --- |
| `imageNamed` 能找到 | ✅ | ✅ |
| `@2x` / `@3x` 自动选 | ✅ | ✅（实测子目录里也生效） |
| 深浅色自动切 | ✅ | ❌ |
| App Thinning / 按需下载 | ✅ | ❌ |
| **拿得到路径和字节** | ❌ | ✅ |
| **支持 webp** | ❌ 编译直接失败 | ✅ |

最后两条是硬约束：

- Asset Catalog 编译后变成一个 `Assets.car`，**里面没有「文件」了**。要上传、算哈希、传给别的 API 的图别放进去
- `actool` 只认 `.png` / `.jpg` / `.heic` / `.svg` / `.pdf`。喂 `.webp` 会报 *"does not have a valid extension"*，而且**整个 catalog 一个产物都不出**

> SVG 有个反直觉的地方：**Asset Catalog 吃得下，运行时解不了**。actool 在编译期把 SVG 栅格化成 1x/2x/3x 三份；而 `imageWithData:` 喂 SVG 字节拿不到图——ImageIO 能解的 58 种类型里没有 SVG。

## 格式：58 种，webp / HEIC / AVIF 都在，GIF 只有第一帧

```
public.png   public.jpeg   com.compuserve.gif   public.tiff
org.webmproject.webp        public.heic / heif   public.avif
public.jpeg-xl              com.microsoft.bmp    com.microsoft.ico
```

**动图只拿得到第一帧**：

```
GIF 88 字节 → UIImage: 4x4, images=nil, duration=0.00
同一份数据 ImageIO 看到 2 帧
```

要播放得用 ImageIO 逐帧拆再喂给 `UIImageView.animationImages`。那条路 UIKit 本来就有，还没做。

## 小图放进大容器

靠的是 [`UIView.contentMode`](ui-view.md)，不是 `UIImageView` 自己的事。

100×100 的图，容器 300×200：

| `contentMode` | 结果 |
| --- | --- |
| `'scaleToFill'`（**默认**） | 拉成 300×200，变形 |
| `'scaleAspectFit'` | 等比到 200×200，四周留白 |
| `'scaleAspectFill'` | 等比到 300×300，上下裁掉 |
| `'center'` | **不缩放**，原尺寸居中 |

```js
iv.contentMode   = 'scaleAspectFill';
iv.clipsToBounds = true;    // ← 少了这行，溢出会画到容器外面
```

`contentMode` 只管内容怎么摆，**不负责裁剪**，这是 UIKit 的老坑。

### 但小图本来就不该被放大

100×100 撑到 300×200 必然糊，这是分辨率问题。正解是九宫格：

```js
const 底 = UIImage.imageNamed('button-bg')      // 20×20 的圆角边框
  .resizableImage({ withCapInsets: new UIEdgeInsets(6, 6, 6, 6) });
```

四条边各 6pt 不参与拉伸，**只拉中间那 8×8**。拉成任意尺寸圆角都不变形。

> 中间那块默认是**平铺**（`'tile'`）不是拉伸——这是实测出来的，不带 `resizingMode` 的那个重载就是这个行为。要拉伸得显式写：
>
> ```js
> img.resizableImage({ withCapInsets: insets, resizingMode: 'stretch' });
> ```

这是 iOS 特有的，Web 里没有对应物（CSS 的 `border-image` 最接近但语义不同）。

## 比例对不上：看谁让步

| 谁让步 | 做法 |
| --- | --- |
| 图让步 | `contentMode`，上面那张表 |
| 容器让步 | JS 自己算：`height = width * (img.size.height / img.size.width)` |
| 都不让 | 九宫格 |

**第 3c 步做完 Auto Layout 之后，这个问题大半会自己消失**——`UIImageView` 的 `intrinsicContentSize` 就是图片的 `size`，只约束宽度，高度按比例自己出来。现在要手算纯粹是因为还在用 frame。

## 解码发生在绘制时，也就是主线程

```js
const img = UIImage.imageWithData(blob);   // 还没解码
iv.image = img;                            // 第一次绘制时才解 ← 主线程
```

大图这一下会掉帧。JS 本来就在主线程抢时间（见[技术选型](../project.md#js-为什么跑在主线程)），比一般 App 更经不起。

```js
iv.image = await img.prepareForDisplay();      // 后台解完再上屏
const 缩略 = await img.prepareThumbnail(new CGSize(60, 60));
```

两个都返回 Promise，解码在后台线程做。

## `UIImage` 是不可变的

改渲染模式、做九宫格，**都返回一张新图，原图不动**：

```js
const 模板 = star.imageWithRenderingMode('alwaysTemplate');
模板 === star;              // false
star.renderingMode;         // 没变
```

所以读出来的图不用防御性复制。

### 模板图和 `tintColor`

```js
iv.image = UIImage.systemImageNamed('star.fill');
iv.tintColor = UIColor.systemPinkColor;             // 整张按这个颜色上色
```

`renderingMode` 为 `'alwaysTemplate'` 时忽略原图颜色，`'alwaysOriginal'` 保留原色。

> 实测纠正一条直觉：**SF Symbol 的 `renderingMode` 是 `'automatic'`，不是 `'alwaysTemplate'`**。「按 tintColor 上色」是**绘制上下文**决定的，不写在图片上——`automatic` 的意思正是「由用的地方决定」。

## 网络图片：字节不进 V8 堆

```js
const blob = await (await fetch(url)).blob();
const img  = UIImage.imageWithData(blob);
iv.image   = await img.prepareForDisplay();
```

字节从 `NSURLSession` 下来一路留在原生的 `NSData` 里，变成 `UIImage` 再上屏，**JS 侧从头到尾只拿着两个句柄**。这是[第 6 步](fetch.md#blob字节不进-v8-堆)的直接收益。

## 属性一览

### `UIImage`（全部只读）

| | |
| --- | --- |
| `size` | **点**，不是像素。已经反映了 `imageOrientation` |
| `scale` | 1 / 2 / 3 |
| `imageOrientation` | `'up'`、`'right'`、`'upMirrored'`… 相机常常横着存靠这个转正 |
| `isSymbolImage` | 是不是 SF Symbol |
| `renderingMode` | `'automatic'` / `'alwaysOriginal'` / `'alwaysTemplate'` |
| `capInsets` / `resizingMode` | 九宫格的边距和填充方式。普通图片是 0 和 `'tile'` |
| `alignmentRectInsets` | Auto Layout 对齐时忽略的视觉边距 |
| `duration` | 逐帧动画一轮的时长，静态图是 0 |

### `UIImageView`

| | |
| --- | --- |
| `image` | 读写 |
| `highlightedImage` | `isHighlighted` 为 true 时显示这张 |
| `isHighlighted` | 读写 |
| `tintColor` | 模板图按这个颜色上色 |
| `isAnimating` | 只读。逐帧动画还没做 |

几何、层级、`contentMode`、`clipsToBounds` 都从 [`UIView`](ui-view.md) 继承。

## 还没做

| | 为什么 |
| --- | --- |
| GIF / APNG 动图 | 要用 ImageIO 逐帧拆，再喂 `animationImages`。UIKit 的机制现成，是我们没接 |
| SVG 运行时解码 | 系统就不支持。进 Asset Catalog 可以，那是编译期栅格化 |
| `UIGraphicsImageRenderer` | 画图、合成、截图 |
| 从文件系统取路径 | 属于第 7 步「本地存储」。所以 `imageWithContentsOfFile` 现在**没有可验证的路径来源** |
| `UIImageSymbolConfiguration` | SF Symbol 的粗细、尺寸、多色配置 |
| `UIView` 级的 `tintColor` | ObjC 里 `tintColor` 定义在 `UIView` 上并沿视图树继承。这一步只在 `UIImageView` 上开了口，别的视图还读不到 |
| 深浅色自动切的变化通知 | 要先暴露 `UITraitCollection` |

---

← 返回 [API 文档](README.md)
