---
type: reference
native: UIImageView
status: partial
---

# `UIImageView`

**`UIImageView`** 表示显示图片的视图，称为图片视图。把一个 [`UIImage`](ui-image.md) 赋给它的 [`image`](ui-image-view/image.md) 属性，图片就显示出来；给的是动图时自动播放。

图片视图不会自己加载图片。显示一张图分两步：先用 `UIImage` 的静态方法取到图片对象，再把它赋给图片视图。

图片怎么摆放（拉伸、等比缩放、裁剪）由继承自 [`UIView`](ui-view.md) 的 `contentMode` 和 `clipsToBounds` 决定，见[图片会不会变形](#图片会不会变形)。

`UIImageView` 自己不派发任何事件。它的属性只会被 App 的代码修改，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → `UIResponder` → [`UIView`](ui-view.md) → `UIImageView`

怎么显示打包的图、网络图片、动图，见指南[显示图片](../guides/images.md)。

## 构造函数

[`UIImageView()`](ui-image-view/constructor.md)

创建一个没有图片、宽高是 0 的图片视图。

## 实例属性

还继承 [`UIView`](ui-view.md) 的属性。图片视图常用的继承属性是 `contentMode`、`clipsToBounds`、`frame`、`backgroundColor`、`layer`。

| 属性 | 说明 |
| --- | --- |
| [`image`](ui-image-view/image.md) | 显示的图片 |
| [`highlightedImage`](ui-image-view/highlightedimage.md) | 高亮状态下显示的图片 |
| [`isHighlighted`](ui-image-view/ishighlighted.md) | 是否处于高亮状态 |
| [`tintColor`](ui-image-view/tintcolor.md) | 模板图的上色颜色 |
| [`isAnimating`](ui-image-view/isanimating.md) <small>只读</small> | 是否在播放用一组图片设置的逐帧动画 |

## 实例方法

`UIImageView` 自己没有声明方法。还继承 [`UIView`](ui-view.md) 的方法。

## 图片会不会变形

会。图片和图片视图的宽高比不一致时，默认的做法是把图片拉伸到填满视图，图片会变形。怎么摆放由视图的 `contentMode` 属性决定：

| 想要的结果 | 写法 |
| --- | --- |
| 完整显示图片，不变形，视图里可以留空 | `contentMode = 'scaleAspectFit'` |
| 填满视图，不变形，超出的部分裁掉 | `contentMode = 'scaleAspectFill'`，并且 `clipsToBounds = true` |
| 填满视图，允许变形 | 默认值 `'scaleToFill'` |

以 100 × 100 pt 的图片放进 300 × 200 pt 的视图为例：

| `contentMode` | 结果 |
| --- | --- |
| `'scaleToFill'`（默认） | 图片拉伸成 300 × 200 pt，变形 |
| `'scaleAspectFit'` | 图片等比放大到 200 × 200 pt，左右各空出 50 pt |
| `'scaleAspectFill'` | 图片等比放大到 300 × 300 pt，上下各超出 50 pt |
| `'center'` | 图片不缩放，按 100 × 100 pt 显示在视图正中 |

表里的尺寸是按各取值的定义算出来的，屏幕上的显示**未在模拟器验证**。`contentMode` 的全部 13 个取值见 [`UIView`](ui-view.md)。

> **注意**：`contentMode` 只决定图片怎么摆，不负责裁剪。用 `'scaleAspectFill'` 时不设 `clipsToBounds = true`，超出视图的部分会显示在视图外面，盖住旁边的内容。

## 图片视图的大小

图片视图有固有尺寸，等于图片的 [`size`](ui-image/size.md)。用哪种方式定位，决定要不要写宽高：

| 定位方式 | 不写宽高时 |
| --- | --- |
| [Auto Layout](auto-layout.md) 约束 | 视图和图片一样大（验收用例验证过） |
| 直接写 `frame` | 视图宽高是 0，看不到图片 |

宽和高都被约束确定之后，图片的尺寸不再影响视图的大小。

## 动图的播放

[`image`](ui-image-view/image.md) 是动图（多帧的 GIF、APNG、WebP）时，图片视图自动播放它，不需要调用任何方法。

- **每帧的时长和播放的遍数按文件里写的来。** 文件里写着一直循环的，一直播放。写着播放 2 遍的，播完 2 遍后停在最后一帧。
- **换成别的图就停。** 给 `image` 赋一张静态图或 `null`，播放停止。
- **图片视图从父视图移除再加回去，不用重新赋值。** 验收用例检查了移除 0.4 秒后播放用的动画还在。加回去之后画面是否接着播放，**未在模拟器验证**。
- **帧的切换由系统完成，不占用 JS 所在的线程。** 这和[图层动画](ca-animation.md)相同。JS 长时间运行期间动图是否继续播放，**未在模拟器验证**。
- 播放期间，图片视图的图层上有一个名字是 `'nacreImageFrames'` 的[关键帧动画](ca-animation.md)，用 `iv.layer.animationForKey('nacreImageFrames')` 可以读到它。播放遍数有限的动图播完之后，这个动画仍然在图层上。
- 播放不反映在 [`isAnimating`](ui-image-view/isanimating.md) 上。
- 图片视图上的动图不能暂停，播完了也没有通知。需要这些时，把帧交给一个图层自己播放，见指南[显示图片](../guides/images.md)。

## 示例

### 显示打包在 App 里的图

从空白 App 开始，在屏幕正中显示项目 `assets/` 里的 `dot` 图片，宽高各 120 pt，不变形。

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

**效果**：屏幕正中 120 × 120 pt 的区域里显示 `dot` 图片，保持宽高比放大。项目里没有这张图时，`image` 是 `null`，什么都不显示，也不报错。**这段代码未在模拟器验证。**

更多写法见指南[显示图片](../guides/images.md)。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[UIImageView alloc] init]` | `new UIImageView()` |
| `iv.image = img` | `iv.image = img` |
| `iv.highlighted = YES` | `iv.isHighlighted = true` |
| `iv.tintColor = UIColor.systemPinkColor` | `iv.tintColor = 'systemPink'` |
| `iv.contentMode = UIViewContentModeScaleAspectFill` | `iv.contentMode = 'scaleAspectFill'` |

### 与浏览器写法的对照

| HTML / CSS | 这里 |
| --- | --- |
| `<img>` | `UIImageView` |
| `<img>` 显示 GIF、APNG、WebP 动图时自动播放 | 相同。动图赋给 `image` 后自动播放 |
| `src` 属性，由元素自己加载 | 没有。先取到 `UIImage`，再赋给 `image`；网络图片用 `fetch` 下载 |
| `srcset` 列出多个倍率的文件 | 文件按 `名字@2x.png`、`名字@3x.png` 命名，系统自动选 |
| `object-fit: fill` | `contentMode = 'scaleToFill'`（默认值） |
| `object-fit: contain` | `contentMode = 'scaleAspectFit'` |
| `object-fit: cover` | `contentMode = 'scaleAspectFill'` 加 `clipsToBounds = true` |
| `object-fit: none` | `contentMode = 'center'` |
| 用 `currentColor` 上色的 SVG 图标 | 模板图加 `tintColor` |
| 浏览器自动缓存图片 | 运行时不提供图片缓存 |

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 暂停、继续图片视图上的动图，或者得知它播完了 | 图层的 `speed`，动画的 delegate。替代做法见指南[显示图片](../guides/images.md) |
| 用一组单独的图片做逐帧动画 | `UIImageView.animationImages`。替代做法同上，把那组图片作为关键帧动画的 `values` |
| 给图片视图以外的视图设 `tintColor`，让子视图继承 | `UIView.tintColor`。`tintColor` 只在 `UIImageView` 和标签栏（[`UITabBarController`](ui-tab-bar-controller.md)）上有 |

## 参见

- [显示图片](../guides/images.md)
- [`UIImage`](ui-image.md)：图片对象从哪里来
- [`UIView`](ui-view.md)：`contentMode`、`clipsToBounds`、位置和大小等继承来的成员
- [`UIButton`](ui-button.md)：手指按住时自动换图
- [`UIColor`](ui-color.md)：`tintColor` 能写哪些值
- [Auto Layout](auto-layout.md)：用约束定位图片视图
