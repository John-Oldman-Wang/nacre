# 外观特征：实现说明

← 返回[实现原理](README.md) ・ [API 文档](../api/ui-trait-collection.md)

外观特征（trait）是 `UITraitCollection` 里那组「当前环境是什么样」的值。这一篇记它是怎么暴露的、为什么这么选、量到了什么。

## 三格都做得了，不卡在机制上

按「读、写、变化通知」三格检查：

| 格 | 原生 | 卡不卡 |
| --- | --- | --- |
| 读 | `traitCollection`，在 `UIView` / `UIViewController` / `UIWindowScene` 上 | 不卡，属性 |
| 写 | `overrideUserInterfaceStyle`，在 `UIView` / `UIViewController` 上 | 不卡，属性 |
| 通知 | 见下 | **原来以为卡在 M2，其实不卡** |

变化通知的老写法是覆写 `traitCollectionDidChange:`，那是覆写点，要 M2。但它在 iOS 17 被废弃了，换成了注册的方式，其中一种是 target-action：

```objc
- (id<UITraitChangeRegistration>)registerForTraitChanges:(NSArray<UITrait> *)traits
                                              withTarget:(id)target
                                                  action:(SEL)action;
```

头文件原话：action 可以带零个、一个或两个参数，第一个是特征变了的那个对象，第二个是变化之前的 `UITraitCollection`。这和控件事件是同一种机制，M1a 就够。我们最低是 iOS 26，直接用。

trampoline（`NacreTraitTarget`）通过关联对象挂在被监听的对象上，注册时拿到的那个凭据也存在它身上，退订时拿去 `unregisterForTraitChanges:`。

## 只注册 JS 读得到的那七项

`UITraitCollection` 有二十多项，先开了七项。注册变化通知时要列出关心哪几项，列的就是这七项：别的项变了，JS 也看不出哪里变了，为它们派发事件只是噪音。

原生注册时可以只挑一两项，JS 这边没开这个口子——一个事件、固定七项。要按项分的话，回调里自己比 `previousTraitCollection` 和现在的值。

文字大小的档位（`UIContentSizeCategory`）是一组字符串常量，不是整数枚举，所以没法用 `NACRE_ENUM_MAP`，自己列了一张「名字、常量」的表（`ContentSizeCategoryPairs`），`check-api.sh` 按 `pairs = @[…]` 的写法去对 d.ts 里的联合类型。

## `UITraitCollection` 是原生对象，不是 JS 这边的结构体

结构体（`CGRect` 那一类）是在 JS 侧按 JSON 建出来的值。`UITraitCollection` 没有这么做，它是一个包着原生对象的包装，字段每次读都过桥。

理由是留着把它**交回原生**的路：`resolvedColorWithTraitCollection:`、`imageWithConfiguration:` 这些接口要的是一个原生的 `UITraitCollection`。现在这些都还没暴露，但做成 JS 值的话以后就得再造一个反向的转换。

它不可变，也不在任何所有权边上：每次读 `traitCollection` 可能拿到不同的原生对象，包装是弱的，用完就被回收。所以它没有「同一个对象」的保证，也不该有——它是值。

## 事件名先按名字认走

`traitchange` 是视图、页面、场景都认的事件名，而这些类的子类各有各的订阅分支，每个分支只认自己那几个名字：控件认 16 个控件事件，滚动视图认滚动那一组，导航控制器认 `willshow` / `didshow`。照原来「按类分」的写法，在一个 `UIButton` 上监听 `traitchange` 会被控件那一支拒掉。

所以订阅入口拆成了两层：

```
setSubscription:                 外层
  1. 是 traitchange，对象是视图 / 页面 / 场景 → TraitSetSubscription，返回
  2. 其余的 → routeSubscription:（原来那一大段，按类分）
  3. 分支报了「不认识这个名字」，而对象是这三类之一 → 名单末尾补上 traitchange
```

第 3 步是为了让报错说实话。各个类报错时列的是自己那张表，里面没有 `traitchange`，而它们其实都多认这一个。

这是 `project.md` 里「订阅按事件名分流」那条 TODO 的又一小步。tab 控制器那次是在它自己的分支里做的，这次是第一个**跨类**的事件名，所以放在了所有分支之前。

JS 侧对应的改动：`UIView` 和 `UIWindowScene` 原来没有订阅钩子（普通视图上的事件名只是 JS 这边的事），现在各加了一个，只在名字是 `traitchange` 时通知原生，别的名字照旧不过桥。

## 实测

都在模拟器上量的（iOS 27.2）。

**1. 写了 `overrideUserInterfaceStyle`，立刻读 `traitCollection` 还是旧值。**

```
card.overrideUserInterfaceStyle = 'dark'
card.traitCollection.userInterfaceStyle     → 'light'      ← 立刻读
…traitchange 到达（light → dark）
card.traitCollection.userInterfaceStyle     → 'dark'
```

系统把特征的更新攒到稍后统一做。原生有 `updateTraitsIfNeeded` 可以让它立刻发生（和 `layoutIfNeeded` 是同一个思路），这次没暴露，文档里写的是「在事件里读」。

**2. 不在窗口里的视图，强制不生效。**

一个没加到界面上的视图写了 `overrideUserInterfaceStyle = 'dark'`，过 2 秒它和它的子视图读到的仍是 `'light'`。强制只在视图进了窗口之后才体现在 `traitCollection` 上。

有一个看上去相反的现象：对一个没上屏的**页面**写 `overrideUserInterfaceStyle`，再读 `page.view.traitCollection`，读到的是新值。区别在于 `page.view` 是那一刻才创建的，创建时就带着页面的设置。

**3. 还没进窗口的视图，各项都读得到。**

`displayScale` 是 3，不是 0；深浅色是系统当前的。方案里担心过「可能是 0」，没有发生。

**4. 系统切换深浅色，场景和视图都收到。**

用 `xcrun simctl ui <设备> appearance dark` 切换（等于模拟器菜单里的 Toggle Appearance）：场景收到 `light → dark`，界面上的卡片也收到；切回去又各收到一次。

文字大小同理：`xcrun simctl ui <设备> content_size extra-extra-large`，场景收到的事件里 `previousTraitCollection.preferredContentSizeCategory` 是 `large`，现在的是 `extraExtraLarge`。

`simctl` 这个办法让「系统切换」可以自动验，不用手点。

## 图层颜色

`layer.borderColor` 这一类在写入时就把动态色解析成了具体颜色（`CGColor` 里没有「随外观变」这一层），所以切换深浅色之后不会变。有了 `traitchange` 之后的写法是在事件里重设一遍，和原生开发一样。运行时不替 JS 记住写进去的是哪个动态色、也不自动重设——UIKit 自己不这么做，那样行为就和 Apple 的文档对不上了。

### 写入时按哪个外观解析

原来是直接取 `color.CGColor`。那用的是系统「当前」的外观（`UITraitCollection.currentTraitCollection`），而 JS 的代码不在 UIKit 的布局或绘制回调里跑，那个「当前」和要写的这个图层没有关系。实测：卡片被强制成深色之后写 `layer.borderColor = 'label'`，读回来是 `#000000`，浅色下的值。五种图层颜色都一样。

改成先找到这个图层**所属的视图**，按那个视图的 `traitCollection` 解析（`resolvedColorWithTraitCollection:`），再取 `CGColor`：

| 图层 | 怎么找到视图 |
| --- | --- |
| 视图背后的那一层 | 它的 `delegate` 就是那个视图 |
| 自己建的子图层 | 沿 `superlayer` 往上，直到碰到一个 `delegate` 是视图的 |
| 一路都没有 | 没有视图可问，仍然取 `color.CGColor` |

改完同一个断言读回来是 `#ffffff`。六个写入点都换了：`borderColor`、`shadowColor`、`backgroundColor`、`CAShapeLayer` 的 `fillColor` / `strokeColor`、`CAGradientLayer` 的 `colors`。

这一条和上面第 1 条实测是连着的：视图刚写了 `overrideUserInterfaceStyle`、还没轮到系统更新时，它的 `traitCollection` 还是旧的，这时写图层颜色解析出来的也是旧外观下的值。所以「在 `traitchange` 里重设」这个写法两头都对得上。

## 没做的

`updateTraitsIfNeeded`、通用的 `traitOverrides`、自定义 trait、其余十几项、`performAsCurrentTraitCollection:`（要一个同步执行的块，卡在 M1b）。

---

← 返回[实现原理](README.md) ・ [API 文档](../api/ui-trait-collection.md)
