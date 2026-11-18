# 毛玻璃：UIVisualEffectView 和效果

← [实现原理](README.md)

这一组是按[接入一组类](adding-classes.md)的做法接的：一个域（`effects`）一套新文件，原生那一侧在 `NacreEffects.mm` 末尾登记一张表，核心的分发器和内部头都没动。API 文档是 [`UIVisualEffectView`](../api/ui-visual-effect-view.md)。

六个类：`UIVisualEffectView`、`UIVisualEffect`（基类）、`UIBlurEffect`、`UIVibrancyEffect`，以及 iOS 26 新加的 `UIGlassEffect`、`UIGlassContainerEffect`。

## 验证到哪一步

写在最前面，免得后面的话被读成比实际更确定：

| | 状态 |
| --- | --- |
| 原生的行为（默认值、读回来的身份、哪些调用会抛） | **实测过**。不带界面的原生小程序，`simctl spawn` 在 iPhone Air 模拟器上跑（iOS 27.2） |
| 原生代码能不能编过 | 编过（Debug，模拟器） |
| `check-api.sh`、类型检查 | 通过 |
| **验收用例（`acceptance/src/steps/effects.js`）** | **没跑过**。接这一组的对话不许占模拟器，由合并的那个对话统一跑 |
| 屏幕上的样子 | 没看过。模糊成什么样、玻璃的质感、鲜明效果，一条都没验证 |
| 真机、iOS 26.x | 没跑 |

所以下面凡是说「实测」的，指的都是原生小程序量到的事实；JS 这一层照这些事实写了断言，断言自己还没执行过。

## 量到的事实

| | 结果 |
| --- | --- |
| `[UIBlurEffect effectWithStyle:]` 同一种样式调两次 | 两个指针，`isEqual:` 为 YES |
| `[blur copy]` | 返回自己 |
| 模糊、鲜明赋给 `effect` 再读回来 | 同一个指针；连读两次也是 |
| `[glass copy]`、`[container copy]` | **新对象** |
| 玻璃、玻璃容器赋给 `effect` 再读回来 | **不是同一个指针，连读两次也不是同一个** |
| 赋值之后改原来的玻璃对象 | 视图里的不变 |
| 改读回来的玻璃对象 | 视图里的也不变 |
| `UIGlassEffect` 的默认值 | `interactive` 是 NO，`tintColor` 是 nil |
| `UIGlassContainerEffect` 的默认值 | `spacing` 是 0。写 -5 照存 |
| `[[UIVisualEffectView alloc] init]` | `effect` 是 nil，`frame` 是 0×0，`backgroundColor` 是 nil，`clipsToBounds` 是 NO，`userInteractionEnabled` 是 YES |
| `contentView` | 私有类 `_UIVisualEffectContentView`，是效果视图的子视图；`autoresizingMask` 是宽高都跟随；换效果、清效果之后还是同一个指针 |
| `contentView` 什么时候建 | 惰性。用玻璃效果建的视图，没读过 `contentView` 时 `subviews` 是空的 |
| `subviews` | 没效果时只有 `contentView`；有模糊时多一个 `_UIVisualEffectBackdropView` |
| 直接 `addSubview:` / `insertSubview:atIndex:` / `…belowSubview:` / `…aboveSubview:` | 四个都抛 `NSInternalInconsistencyException`，没有效果的视图也抛。抛了之后子视图个数不变，那个视图没有父视图 |
| `[UIBlurEffect effectWithStyle:99]` | 不抛，给一个效果（描述里写着 `UltraDark`） |
| `[UIVibrancyEffect effectForBlurEffect:nil]` | 不抛，给一个效果 |

## 玻璃：视图存的是副本，所以读回来不去找「写进去的那个」

头文件里 `effect` 是 `copy`。模糊和鲜明不可变，`copy` 返回自己，所以它们从 JS 看起来就是普通的对象属性：写进去的和读回来的是同一个包装。

玻璃和玻璃容器带可写的属性，`copy` 给的是新对象，而且视图每次被读 `effect` 都再复制一份。于是 `view.effect !== glass`，`view.effect !== view.effect`。

图层的 `path` 也有「读回来换了一个对象」的问题，那里的做法是 JS 侧的镜像里有就还镜像里的那个，身份靠镜像稳住（见[图层](ca-layer.md)）。这里**没有**照搬，原因是两边的对象性质不同：`UIBezierPath` 交进去之后图层存的是它当时的形状，而我们还回去的那个 JS 对象之后被改了也只是「JS 手里的路径和图层里的不一样了」，读 `path` 的人拿到的至少是他自己写进去的东西。玻璃效果是拿来读属性的——`view.effect.tintColor` 问的是「视图现在用的是什么颜色」。把写进去的那个对象还回去，它之后被改过的话，这句话读到的就是一个视图里并不存在的值。

所以按原生的事实来：读回来的按类现包一个，每次都是新的包装。代价是 `===` 在玻璃上不成立，写进了文档和断言。所有权镜像在这里只起一个作用：读到的那个包装被 `effect` 这条边记着，仅此而已。

## 直接加子视图：在调用之前拦

这是这个类最常见的写错方式，UIKit 自己的反应是抛异常。运行时的每个入口都有异常保底（见[参数转换](conversion.md#第-4-步入口的异常保护)），不拦也不会崩，会得到一个带着 UIKit 原话的 `TypeError`。

仍然单独拦了，照的是保底那一节自己定的规矩：保底不是该走的路，已知的调用点要先查再调。拦在**原生**这一侧的方法通道里（`EffectsCallMethod` 认领 `addSubview:` 和所有 `insertSubview:` 开头的 selector），不是在 JS 的类上覆写 `addSubview`。两个理由：

- 认的是对象的原生类，不是 JS 包装的类。效果视图的包装如果被回收后按 `UIView` 重建（`superview.subviews` 读回来就是按 `UIView` 包的），JS 侧的覆写就不在了，原生这一侧的照样在。
- 类型定义里不用为了「这个方法不能用」重新声明一遍父类的方法。

能拦到是因为登记的域先于核心被问到。报错在记所有权边之前抛出（`nativeCall` 在 `ownOne` 前面），所以被拒的视图不会留在镜像里。

## 构造带对象参数

`new UIVisualEffectView(effect)` 走 `construct` 通道，参数拆法和方法一样：对象进句柄，标量进 JSON。原生这一侧两种都要看：

- 对象位有东西，但不是 `UIVisualEffect` → 拒
- 对象位是空的，标量位不是 `null`（`new UIVisualEffectView('systemMaterial')`）→ 也拒。不看标量位的话，字符串会被当成「没给效果」放过去

`undefined` 过 JSON 是 `null`，和不给一样。

JS 那一侧构造完记一条 `effect` 的所有权边，和属性写入记的是同一条。`check-api.sh` 的所有权检查盯的是方法和属性，不盯构造函数，这一条是靠验收里的 GC 断言盯着的。

## 第一个用 `writeObject` 通道的域

[接入一组类](adding-classes.md#没验证的)里记着：十六条通道里有七条接了线、但迁过去的三个域用不到。这一组用到了其中的 `writeObject`（`effect`、玻璃的 `tintColor`）。

用的时候发现一处对不上：取对象值的宏 `NACRE_OBJECT_OR_NIL` 是给核心里那几个返回 `void` 的函数写的，失败时 `return;`；而登记的 `writeObject` 返回 `bool`，宏在里面编不过。这里把那四行展开手写了（类型不对就调 `ObjectTypeError` 并返回 `true`）。下一个用这条通道的域会碰到同一件事，值得在共享头里给一个返回 `bool` 的版本——那是共享文件，这一步没动。

这条通道在运行时里**实际走没走通，还没验证**，和验收一起。

## 枚举

三张表都在 `NacreEffects.mm` 里，类型的联合在 `effects.d.ts` 里。

- `UIBlurEffectStyle` 二十个值。头文件里的 `ExtraDark` 标着 `API_UNAVAILABLE(ios)`，没收。没有别名（没有 `= 另一个值` 的写法），没有已废弃的值
- `UIVibrancyEffectStyle` 八个值
- `UIGlassEffectStyle` 两个值

**这三张表和类型的联合对不对得上，`check-api.sh` 没有核对。** 它的枚举核对是一张写死的名单（第 4 节），新域的枚举要往名单里加一行才会被盯到，而那个脚本这一步不许碰。现在靠的是类型检查那一边：验收里把二十个、八个值各走了一遍，写错的名字标了 `@ts-expect-error`。原生表里多一个或少一个值，要等验收跑起来才看得出。

原生不校验枚举的数值范围（传 99 也给一个效果），所以名字查不到就在我们这一侧拒掉，不会有不认识的数值流到 UIKit。

## 类型：两个只给类型检查用的私有成员

`UIVisualEffect`、`UIBlurEffect`、`UIVibrancyEffect` 在 JS 里没有任何实例成员。TypeScript 的类型是按结构比的，一个没有成员的类，任何 `NSObject` 的子类都赋得进去——`view.effect = new UIView()` 类型检查是绿的，而运行时会抛。

所以在声明里给 `UIVisualEffect` 和 `UIBlurEffect` 各加了一个私有成员（`private readonly __visualEffect: void`）。带私有成员的类在 TypeScript 里只和它自己、它的子类兼容，这样写错的赋值在编辑器里就报。运行时没有这两个成员。

这是这个仓库里第一次这么写，别的类都有自己的成员所以没遇到过。以后再有没有成员的类（纯粹的值对象、令牌）可以照这个办。

## 没做的

| | 为什么 |
| --- | --- |
| `UIColorEffect` | 它唯一的工厂方法 `+effectWithColor:` 是 iOS 26.1 才有的，最低版本是 26.0。接它要写两层版本保护，并且定一个「26.0 上调了怎么办」，而它做的事（纯色背景）现在用 `backgroundColor` 就有 |
| 换效果时的过渡动画 | 要 `UIView` 的动画 block，那条路卡在同步回调上 |
| `UIView.cornerConfiguration`（iOS 26） | 给已有的类加成员，排在独立的这几组之后 |
| `spacing` 的负值 | 实测 UIKit 照存，但头文件没说负的距离是什么意思，所以写入时拒。和触感反馈的强度范围是同一个处理 |
