# 动图

GIF、APNG、动画 WebP。API 文档在 [`UIImage` / `UIImageView`](../api/ui-image.md#动图)，这里记怎么搭的、为什么这么选、量到了什么。

一句话：**取图的时候把帧读出来挂在那张 `UIImage` 上，交给 `UIImageView` 时在它的图层上挂一条 `contents` 的关键帧动画。** 播放由渲染进程完成，不经过主线程。

## Web 是怎么做的

- **`<img>` 没有任何播放 API。** GIF、APNG、动画 WebP 都是「一张图」，放上去就自己动；每帧时长和循环次数来自文件，JS 不能暂停、不能跳帧。
- **要控制用另一套**：WebCodecs 的 `ImageDecoder`，给出帧数和循环次数，按下标解一帧，自己画到 canvas。
- **实现上两家不一样。** Chromium 由合成器线程推进帧（`cc::ImageAnimationController`），不靠主线程；WebKit 是每帧一个定时器推进，下一帧在后台队列解码，没解好就等。

我们照的是第一条的形状：图就是图，放进图片视图自己播。第二条对应底层——帧、每帧时长、循环次数都读得到，图层的 `contents` 和关键帧动画都开着，要控制就自己挂。

## iOS 这边量到的

iPhone Air 模拟器，iOS 27.2。用的是一次性的原生探针（一个命令行程序加一个小 App），不在仓库里。测试图 12 帧、240×240。

| 量什么 | 结果 |
| --- | --- |
| ImageIO 认不认 | GIF、APNG、动画 WebP 都认。帧数、每帧时长、循环次数都读得到 |
| `+[UIImage imageWithData:]` | 三种都是静态图：`images` 是空的，`duration` 是 0 |
| 全部帧解成位图 | 各 2.64 MB（240 × 240 × 4 × 12）。耗时 GIF 72 ms、APNG 14 ms、WebP 11 ms |
| `UIImageView` 播 `+animatedImageWithImages:duration:` 的图时，图层上是什么 | 三条 `CAKeyframeAnimation`：`contents`、`contentsTransform`、`contentsMultiplyColor`。都是 `discrete`，`keyTimes` 是空的（每帧等长），`repeatCount` 是无限 |
| `CGAnimateImageDataWithBlock`（系统的逐帧播放函数） | 三种都能播，包括 WebP。回调在主线程；主线程被占住 1 秒，这 1 秒里回调 0 次，放开之后恢复 |

第四行是这个方案的依据：**UIKit 自己播动图用的就是图层上的关键帧动画**，我们挂的是同一种东西。

「图层动画由渲染进程播放、不受主线程影响」这一条没有在这次单独验证（要靠截图）。它是 Core Animation 的公开行为，试用 App 里的光晕动画也是靠它在 JS 忙的时候继续动的。

## 三条路，选了哪条

| | 做法 | 主线程忙的时候 | 代价 |
| --- | --- | --- | --- |
| A | 用 `+animatedImageWithImages:duration:` 造一张 UIKit 的动图 | 照动 | 全部帧常驻内存；**只有一个总时长**（每帧等长）；**没有循环次数**，永远无限循环 |
| **B** | **自己在图层上挂 `contents` 的关键帧动画** | **照动** | 全部帧常驻内存 |
| C | 逐帧换图（`CGAnimateImageDataWithBlock`，或者每帧回调按下标解码） | 停在当前帧（实测） | 内存小，适合大动图 |

选 B。A 丢的两样东西都是文件里的事实：实测的 WebP 里有一帧是 0.25 秒、别的是 0.1 秒；没写循环信息的 GIF 应该只播一遍。

C 没做。JS 在主线程、又没有 JIT，「一忙就停」在我们这里比在普通原生 App 里更常见；而且还没有人被大动图的内存挡住。代价是下面那条预算。

## 帧信息挂在哪

`NacreAttachFrames(image, data)` 用 ImageIO 把帧读出来，装进一个 `NacreImageFrames`（帧、每帧时长、总时长、循环次数），用关联对象挂在那张 `UIImage` 上。三条取图路径各调一次：`imageNamed`、`imageWithContentsOfFile`、`imageWithData`。

**那张图本身还是 UIKit 给的静态图（第一帧）。** 没有另造一张，理由有三条：

- 它在任何收 `UIImage` 的地方都照常能用（按钮、标签栏、九宫格），只是不动——和改之前的行为一样，不会因为加了动图而变。
- `imageView.image = img` 之后读回来还是同一个指针，JS 侧「写进去的对象原样读回来」不用额外处理。
- 如果给的是 UIKit 的动图（A 那种），`UIImageView` 会挂上它自己那三条等长的动画，和我们的打架。

连带的后果：**从动图派生出来的图是静态的。** `imageWithRenderingMode`、`resizableImage`、`prepareThumbnail` 给的都是新的 `UIImage`，身上没有帧信息。`prepareForDisplay` 是特意处理过的，见下。

### `imageNamed` 要把文件再找一遍

`+imageNamed:` 不告诉我们它最后用了哪个文件，而读帧需要文件的字节。所以 `NacreDataForNamedImage` 按它的规则再找一遍：名字里可以带子目录；不带扩展名的当 `.png`（APNG 靠这条）；`@2x` / `@3x` 看那张图的 `scale`——系统已经替我们挑过了，照着它挑的那个倍率找。

Asset Catalog 里的图没有文件，找不到，保持静态。这一条没有验证：命令行工具生成的工程没有往 Asset Catalog 里放图的途径。

`imageNamed` 有缓存，同一个名字给的是同一个对象，所以挂之前先看挂过没有。

文件是映射进来的（`NSDataReadingMappedIfSafe`）而不是读进来的：帧是按需解码的，字节要一直留着。

### 只认三种格式，不认帧数

多帧不等于动图：多页 TIFF、带辅助图的 HEIC 也是多帧。所以判断的是类型（GIF、PNG、WebP）加帧数大于 1。HEIC 序列和动画 AVIF 没有测试文件，没做。

### 每帧时长取 `DelayTime`，不取 `UnclampedDelayTime`

实测文件里写 0.01 秒的 GIF 帧、0.005 秒的 WebP 帧，`DelayTime` 给的都是 0.1，`UnclampedDelayTime` 才是原值。系统把过短的时长抬到 0.1 秒，和浏览器的做法一致——那种文件是按「浏览器会抬」的前提做出来的，照原值播会快得离谱。

读不到时长的帧也按 0.1 秒算。

### 循环次数：ImageIO 给的已经是「一共播几遍」

| 文件里写的 | `LoopCount` 读出来 |
| --- | --- |
| GIF，循环扩展写 0（一直循环） | 0 |
| GIF，没有循环扩展 | 1 |
| GIF，循环扩展写 3（再重复 3 次） | 4 |
| APNG，播 2 遍 | 2 |
| WebP，循环 4 次 | 4 |

所以原样用，0 是一直播。到 JS 是 `loopCount`：正整数或者 `Infinity`，可以直接赋给动画的 `repeatCount`。桥上 `Infinity` 是字符串 `'infinity'`（JSON 里没有它），和 `repeatCount` 同一个做法。

各家浏览器对「GIF 写 3」到底播 3 遍还是 4 遍没有逐一核对。

## 预算：解码后超过 64 MB 的不播

所有帧都要解成位图常驻内存，大小是宽 × 高 × 4 × 帧数。一张 600×600、300 帧的 GIF 是 412 MB，文件本身可能只有几 MB，而从网络上拿到什么不由 App 决定。不拦的后果是进程被系统杀掉，没有任何报错。

超过预算时只给第一帧（那张图照常能用），并打一条运行时日志：

```
[nacre] animated image not played: 5 frames of 2048x2048 need 80 MB decoded, over the 64 MB budget; showing the first frame only
```

检查发生在真正占内存之前：`CGImageSourceCreateImageAtIndex` 建的是还没解码的图，只读了宽高。

**64 MB 这个数没有外部依据，是写的时候定的**，一个常量（`kFrameBudgetBytes`）。它按单张图算，不管同时有几张。常见的表情和加载指示在几 MB 以内；480×270、100 帧的那种动图是 52 MB，还在线内；再大就不播了。要让大动图也能播，得做 C。

这条日志 JS 看不到（它不是 `console` 的输出）。超预算的图 `images` 是 `null`，JS 能据此判断。

## 挂在图片视图上的那条动画

`NacreSyncFrameAnimation(view)` 在写 `image`、`highlightedImage`、`isHighlighted` 之后各调一次：先摘掉旧的，再看当前该显示的那张图（高亮并且有高亮图时是高亮图，否则是 `image`）身上有没有帧，有就挂。

| 参数 | 值 | 为什么 |
| --- | --- | --- |
| key | `nacreImageFrames` | JS 用 `layer.animationForKey()` 读得到它，所以这个名字是 API 的一部分 |
| `keyPath` | `contents` | |
| `values` | 每帧的 `CGImage` | |
| `keyTimes` | 每帧开始的时刻占总时长的比例，**比 `values` 多一个**，首尾是 0 和 1 | `discrete` 模式的要求：第 i 个值从 `keyTimes[i]` 显示到 `keyTimes[i+1]` |
| `calculationMode` | `discrete` | 帧与帧之间不过渡 |
| `duration` | 播一遍的时长 | |
| `repeatCount` | 文件里的循环次数，一直播是 `HUGE_VALF` | |
| `removedOnCompletion` | `NO` | 见下 |
| `fillMode` | `forwards` | 播完有限的几遍之后停在最后一帧，不弹回第一帧，和浏览器一致 |

### `removedOnCompletion` 必须是 `NO`

默认是 `YES`，而系统会在视图离开窗口时把这样的动画摘掉。UIKit 对它自己的动画会在视图回来时重新挂上，对我们的不会。实测（三个图片视图并排：默认值、设成 `NO`、UIKit 自己的动图）：

| 时刻 | 默认（`YES`） | 设成 `NO` | UIKit 自己的 |
| --- | --- | --- | --- |
| 挂上 1 秒后 | 在 | 在 | 在 |
| 移出父视图 0.3 秒后 | **没了** | 在 | 在 |
| 加回去 0.3 秒后 | 没了 | 在 | 在 |
| 被全屏模态盖住 0.5 秒 | 没了 | 在 | 在 |
| App 退到后台 | 没了 | 在 | 在 |
| 回到前台 0.5 秒后 | 没了 | 在 | 在 |

这张表量的是 `animationKeys` 里有没有那个 key，也就是动画还挂不挂着。**回来之后画面上是不是真的在动，没有验证**（要看屏幕）。

这一条如果不成立，方案 B 就得改成继承 `UIImageView` 覆写 `didMoveToWindow`——所以是动手之前先量的。

### 没管的两处

- **UIKit 自己改高亮状态时不跟。** 我们只在 JS 写那三个属性时同步。图片视图放进会自动管理高亮的容器（按钮自己的 `imageView`）时，高亮图是动图的话不会跟着切。
- **`isAnimating` 不反映它。** 那个属性说的是 UIKit 的 `animationImages`，读出来一直是 `false`。有限循环的动图播完之后动画还挂着（为了停在最后一帧），所以「key 在不在」也不等于「在不在播」。暂停、知道播完了没有，都要走底层自己挂动画。

## `prepareForDisplay` 把所有帧放到后台解

不处理的话，动图第一次显示时所有帧在主线程上解（12 帧的 GIF 是 72 ms）。所以动图走自己的一条路：后台队列上对每一帧调 `-imageByPreparingForDisplay`，然后给回一张新图——它是解码过的第一帧，身上挂着解码过的所有帧，每帧时长和循环次数原样带过去。

第一帧要另包一个 `UIImage`（`+imageWithCGImage:`），不能直接把帧信息挂在 `decoded[0]` 上：那一帧自己还会作为 `images` 的成员交给 JS，挂上去之后 `images[0].images` 又是一整套。

## 底层：`contents` 和图片取值

- **`CALayer.contents`** 可读可写，JS 侧是 `UIImage`，原生取它的 `CGImage`。读回来只能现包一个新的 `UIImage`，所以 JS 侧记了镜像，和 `CAShapeLayer.path` 同一个做法。`contents` 在 ObjC 里是 `id`，我们只认 `CGImage` 一种；视图自己画出来的内容是系统的后备存储，读成 `null`。
- **动画的 keyPath 表加了 `contents`**，取值类型是新的一种 `NacreAnimValueImage`。`values`、`fromValue`、`toValue`、`byValue` 都收 `UIImage`，走对象通道（和颜色、路径一样）。没有位图的图（SF Symbol）取不到 `CGImage`，当成类型不对拒掉。
- 读出来的图是按 `CGImage` 现包的，`scale` 是 1，不是写进去的那个对象。

## framework 多链了一个 ImageIO

`ios/project.yml` 里显式声明。它不带任何要用户声明的东西（没有权限文案，不在 required reason API 里），UIKit 本来也依赖它。

## 没做的和没验证的

| | |
| --- | --- |
| 大动图边播边解（C） | 没做。超预算的只显示第一帧 |
| HEIC 序列、动画 AVIF | 没做，没有测试文件 |
| 暂停、继续、跳到某一帧 | 上层没有。底层可以自己挂动画做 |
| 播完的通知 | 上层没有。自己挂的动画有 `stop` 事件 |
| JS 长时间占着主线程时画面还动不动 | 没验证（要看屏幕） |
| 视图离开窗口、App 退后台再回来之后画面还动不动 | 只验了动画还挂着 |
| 真机 | 没跑 |
| Asset Catalog 里的动图 | 没验证，按实现是静态的 |

---

← 返回[实现原理](README.md) ・ [API 文档](../api/ui-image.md)
