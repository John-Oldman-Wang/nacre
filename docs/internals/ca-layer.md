# 图层

CGColor 的代价、和 UIView 重叠的属性怎么取舍、子图层为什么不跟布局。

## 第 3d 步：CGColor 和重叠属性

**为什么 `layer` 上的颜色读两次不相等。** ObjC 那边 `borderColor` / `shadowColor` 的类型是 `CGColorRef`，不是 ObjC 对象。桥上用 `colorWithCGColor:` 包成 `UIColor`，而**它每次新建一个对象**——实测两次指针不同（`0x…880` / `0x…8a0`）。包装机制「同一个原生指针永远同一个 JS 对象」的保证因此失效：不是机制坏了，是我们每次造了个新原生对象。

底下的 `CGColor` 指针倒是**稳定的**，所以补法是按 `CGColorRef` 缓存 `UIColor`。

颜色全面字符串化之后这条的表现变了但根因没变：读出来是**字符串**，所以 `===` 不再是问题；真正丢的是**动态色**。

**动态色为什么会被定死。** `CGColor` 是解析后的值，没有 `UIColor` 那一层「`UITraitCollection → UIColor` 的函数」。写进去的那一刻就按当前外观解析完了。UIKit 自己的解法是在外观变化时重设一遍，那要等 `UITraitCollection` 暴露出来。和[颜色文档](ui-color.md)里「读出不做成字符串」是同一个根因。

**`cornerCurve` 的默认值。** `CALayer.h` 写着「Defaults to `kCACornerCurveCircular`」，iOS 26 上实测**裸 `CALayer` 就是 `continuous`**，`UIView.layer` / `UILabel.layer` 也一样。文档和实际不符，以实际为准。

**位掩码的形状。** `maskedCorners` 是第一个位掩码属性，定下了这类属性的写法：JS 侧字符串数组，`NACRE_MASK_MAP` 宏双向拆合，「不是数组」和「名字不认识」报两种不同的错。往后 `autoresizingMask`、`UIControlEvents` 都照这个来。

## A5-1：子图层和渐变

### 「只暴露 `UIView` 上没有的」这条作废了

第 3d 步定的是：`CALayer` 和 `UIView` 重叠的那些（`opacity` / `backgroundColor` / `masksToBounds` / 几何 / `isHidden`）一个都不开，理由是同一件事两种写法正是[原则 1](../project.md#原则)要消灭的东西。

**独立子图层一来，这条守不住了。** 渐变层要 `masksToBounds` 配圆角，纯色块要 `backgroundColor`，所有子图层都必须有 `frame`——而 view 在这些图层上**没有对应物**。属性又是定义在类上的，开了之后 `view.layer.opacity` 也跟着有了。

所以改成：**`CALayer` 按它自己的面暴露，文档里指明「view 自己那一层请用 view 的写法」。** 能力完整优先于入口唯一，因为这里的「两种写法」并不是真的二选一——它们服务的是两类不同的对象。

### 子图层为什么不跟布局

查过 SDK 头文件，`CALayer` 的两个布局机制在 iOS 上都不可用：

```objc
@property CAAutoresizingMask autoresizingMask
  API_AVAILABLE(macCatalyst(13.1)) API_UNAVAILABLE(ios, tvos, watchos, visionos);
@property(nullable, strong) id <CALayoutManager> layoutManager
  API_AVAILABLE(macCatalyst(13.1)) API_UNAVAILABLE(ios, tvos, watchos, visionos);
```

`CAConstraintLayoutManager.h` 整个文件也包在 `API_UNAVAILABLE_BEGIN(ios…)` 里。约束只作用于 view，不作用于图层。

**这不是 Nacre 的缺口，是 iOS 本来就这样**——原生 App 也得在 `layoutSubviews` 里一行行手写子图层的 frame。

三条补救路，都不在这一步：

| | 为什么不做 |
| --- | --- |
| 覆写 `layoutSubviews` | **M2**，JS 子类化原生类 |
| `+[UIView layerClass]` | 同样是 **M2**（类方法覆写） |
| KVO 监听 `view.layer.bounds`，做成 `layoutchange` 事件 | **不需要 M2**，但那是新发明一个事件，该单独走一遍 SOP。记在待办里 |

`CALayerDelegate.layoutSublayersOfLayer:` 在 iOS 上可用，但救不了这件事：它只在**那个图层自己**被标记需要布局时才调，而父图层变大并不会标记子图层。

### 字符串枚举没有新机制

`CAShapeLayerFillRule` / `CALineCap` / `CAGradientLayerType` 这些在 ObjC 里是 `NSString*` 常量，不是 `NS_ENUM`，所以 `NACRE_ENUM_MAP`（名字 ↔ 数字）用不上。

但这条路**第 3d 步就铺好了**：`cornerCurve` 已经是 `NSString*` 常量，用的是手写有序 pairs（`CornerCurvePairs`）。`GradientTypePairs` 照抄同一个形状，`check-api.sh` 也照抄那一行正则。

**没有抽成宏**，哪怕三个值重复了几十行：宏铺开之后 `check-api.sh` 的正则看不见里面的名字，而「能被检查看见」比「少写几行」重要——这条在枚举拆分时已经付过一次代价了。

### 为什么 `sublayers` 和 `colors` 走对象数组通道

`sublayers` 是一组原生对象，走的是已有的「对象数组读」通道（和 `subviews` / `constraints` 一样），各域只管往 `refs` 里追加。

`colors` 是第二个**可写的**对象数组属性（第一个是导航栈）。它存的是 `CGColorRef`，JS 侧是颜色字符串，所以写入时在原生层做 `UIColor → CGColor`，读出来再 `colorWithCGColor:` 包回去——和 `borderColor` 完全同一条路，动态色同样会被定死。

**`colors` 不需要所有权边。** `CAGradientLayer.colors` 是 `copy` 的，而且 `CGColorRef` 被数组 retain 住，JS 侧的 `UIColor` 包装被回收也不影响原生值。JS 侧仍然 `ownAll` 了一笔，纯粹是为了和 `nativeSetObjectArray` 的既有形状一致，不是正确性要求。

### `LayerClassName`：包装表按指针缓存，所以类名不能瞎写

包装表的规矩是「同一个原生指针永远是同一个 JS 对象」，而那个对象的类在**第一次包装时**就定了。所以凡是把图层交给 JS 的地方（`sublayers`、`superlayer`）都得问一句它实际是哪个类：

```objc
const char* LayerClassName(CALayer* layer) {
  if ([layer isKindOfClass:CAGradientLayer.class]) return "CAGradientLayer";
  return "CALayer";
}
```

一律写 `"CALayer"` 的话，一个渐变层只要先从 `sublayers` 里被读到过，它在 JS 里就**永远**是个 `CALayer`，`g.type` 直接没有——而且这个错不会在写的那一行暴露。

### 实测：`contentsScale` 连 `view.layer` 都是 1

写文档时想当然地写了「自己建的图层默认 1，`view.layer` 不用管，UIKit 已经设好了」，
**验收用例当场打脸**：场景接入时读 `vc.view.layer.contentsScale`，拿到的也是 `1`。

猜测是 UIKit 要到第一次真正绘制时才把屏幕 scale 写上去，但**什么时候变、变不变都没实测过**，
所以结论只能停在「别拿它当屏幕 scale 读」。

连带出一个缺口：JS 现在**没有任何地方读得到屏幕的 scale**——`UIScreen` 没暴露，
`UITraitCollection.displayScale` 也没有。需要高清光栅化时只能写死 3。
这条跟 `UITraitCollection` 一起补。

### 域名冲突靠类型判断，不靠顺序

`frame` / `bounds` / `isHidden` 在 `ReadLayerProperty` 和 `ReadViewProperty` 里都有，而 Layer 域排在 View 前面。不冲突的原因是每个分支先问 `isKindOfClass:CALayer.class`——`UIView` 永远走不进来。

同一个文件里 `CAGradientLayer` 的分支排在 `CALayer` 之前，和分发表「子类在父类之前」是同一条规矩。

---

← 返回[实现原理](README.md) ・ [项目说明](../project.md)
