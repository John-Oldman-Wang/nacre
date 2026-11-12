# 导航

第 5a 步。清单上原来写的是「`UINavigationController`、**继承 `UIViewController`**」，也就是暗含 M2；实际查下来**栈操作本身不需要 M2**，所以切出来先做。

## 生命周期和导航事件的分界

`UIViewController` 的五个生命周期方法：

```objc
- (void)viewDidLoad;
- (void)viewWillAppear:(BOOL)animated;
- (void)viewDidAppear:(BOOL)animated;
- (void)viewWillDisappear:(BOOL)animated;
- (void)viewDidDisappear:(BOOL)animated;
```

**全是覆写点，不是 delegate**，没有 M2 一条都拿不到。

但 `UINavigationControllerDelegate` 给了两条逃生口——`willShowViewController:animated:` 和 `didShowViewController:animated:`——那是 delegate，[滚动那一步](scrolling.md#第三种事件源delegate-trampoline)的 trampoline 原样能用。它覆盖「某个页面要显示 / 已显示」，是多数 App 实际用生命周期干的那件事。

> 所以 `willshow` / `didshow` 不是生命周期的**简化版**，是它在**导航这一层**的替代品：它知道「哪个页面」，但不知道「这个页面自己被加载了」。

## 事件带数据：判据是「对象上读不读得到」

这一步修正了滚动那一步留下的一个过宽的说法。规矩不是「事件一律不带数据」，而是：

> **那个信息在对象上读不读得到。读得到就别重复一份，读不到就带上。**

| 事件 | 带不带 | 为什么 |
| --- | --- | --- |
| `scroll` | 不带 | 位置在 `contentOffset` 上读得到，而且**不带才能无损合并**（同一轮多次滚动合成一个） |
| `willshow` / `didshow` | **带** `viewController` | 「哪个页面」在 `willshow` 那一刻从 `nav` 上读不到（`topViewController` 还没换过去），而且导航事件没有合并的需要 |

原生送过来的东西没有理由花力气去掉。

实现上多了一条路：`EmitObjectEventWith` 在原来两个参数后面加一个原生对象，JS 侧的 sink 按类型决定字段名：

```js
const objectEventField = { willshow: 'viewController', didshow: 'viewController' };
```

**字段名留在 JS 侧定**，因为那是 API 命名，属于上层的事。

## 新开的通道：`write_object_array_property`

`viewControllers` 在 ObjC 里是**可写**的数组属性。我们此前只有「对象数组属性**读**」（`subviews`、`arrangedSubviews`），没有写。

两条路都摆出来过：只暴露 `setViewControllers(…, { animated })` 方法、属性留只读——但那违反「能力完备」；或者开这条通道。选了后者，因为它只是读那条的镜像：

```cpp
std::function<void(void* ptr, const std::string& name,
                   const std::vector<void*>& values, std::string* error)>
    write_object_array_property;
```

JS 侧 `nativeSetObjectArray` 把数组摊成一串句柄，复用 `HandlesToPtrs`——和方法的数组参数同一条路。**它带 `error` 出参**，所以「栈里塞了个颜色」会抛 `TypeError`，不会被当成 nil 吞掉。

## 所有权镜像：`ownAll` 就够，不用逐个记进出

讨论时一度以为这是最复杂的一次镜像——栈有**批量移除**（`popToViewController` 一次弹好几个），而前面几步基本都是「加进去不拿出来」。

再看一遍发现**`ownAll` 已经解决了**。它的语义是「按原生的真相把这一层整个重建」，`subviews` 用的就是它。所以栈变动之后统一：

```js
[kSyncStack]() {
  ownAll(this, 'viewControllers', nativeGetObjectArray(this, 'viewControllers'));
}
```

`push` / `pop` / `popTo` / `popToRoot` / `setViewControllers` / 属性赋值，**一视同仁**——不记谁进谁出，只问原生「现在栈里是哪几个」。

另外两条是 ObjC 侧的 weak 回边，按规矩在 JS 侧翻成 strong，用现成的 `nativeGetOwned`：

- `vc.navigationController`
- `vc.parentViewController`

### 这条边漏了会怎样

这是整个讨论里追得最细的一处，所以留个回归用例：

```js
(() => {
  const ghost = new UIViewController();
  ghost.title = '幽灵页';
  ghost.probe = '挂在包装上的 JS 状态';
  nav.pushViewController(ghost, { animated: false });
})();                       // ← ghost 出作用域，JS 这边不再引用
// …制造垃圾逼 GC…
nav.topViewController.probe;   // 漏了 ownAll 的话：undefined
```

原生侧完全正常——`nav.viewControllers` 强持有它，页面好端端在栈上。坏掉的只有 JS 那一侧：包装被回收，`ptr_to_handle` 里那一条被擦掉，下次同一个指针回来就**按类名重建一个全新的包装**，挂的状态和监听器全没，而且**不报任何错**。

断言放在所有权镜像那一步做，因为那边已经有「对照组证明 GC 真跑过」的那一套。

## 撞出来的一件事：父类要挡子类

`new UINavigationController()` 第一次跑直接抛：

```
TypeError: Cannot redefine property: Symbol(nativeHandle)
    at constructNative (nacre:internal/nacre.js:375)
    at new UINavigationController (nacre:internal/nacre.js:1914)
```

因为 `UINavigationController extends UIViewController`，`super()` 先建了一个 `UIViewController`，子类又建一次，`kHandle` 重复定义。

数了一遍，这个闸的分布是有规律的：

| 类 | 挡子类 | 为什么 |
| --- | --- | --- |
| `UIView` | 有 | `UILabel` / `UIImageView` / `UIScrollView` / `UIControl` 都继承它 |
| `UIControl` | 有 | `UIButton` 继承它 |
| `UIButton` | 有 | |
| `UILabel` / `UIImageView` / `UIScrollView` / `UIStackView` | 无 | 没有运行时子类继承它们 |
| `UIViewController` | **之前没有** | 在这一步之前也没人继承它 |

**规律是：一个类需要 `new.target` 闸，当且仅当另一个运行时类继承它。**

> **这一节记的是当时的状态，已经不是现在的实现了。** 那条隐规则没有任何东西检查，漏过一次也抄错过一次，后来整套换成了「闸吃进 `constructNative`、原生类一律 final」，见[包装机制](wrapper.md#原生类为什么定成-final)。

代价是已知的那个洞：加了闸之后 `class MyPage extends UIViewController {}` **建不出原生对象**。而「用自己的页面类」恰恰是最可能的用法，所以这个洞从「理论缺陷」变成了「实际挡路」。

> **正经的修法不是继续加闸，是把构造挪出构造函数**：让最底下那个类按 `new.target` 的真实类名去建，而不是每个类各自硬编一个类名。那样一次 `constructNative` 都不会重复，`new.target` 闸整套可以撤掉，ES 子类也自然拿到对的原生对象。代价是每个类的构造参数不一样（`UIWindow` 收场景、`UIStackView` 收数组、`UINavigationController` 收根页面），要重新组织一次。这件事和「JS 子类化原生类」是同一个 TODO，一起做。

## 多页面 demo：router 是**用户侧**的东西

做完栈之后在 `app/src/router.js` 写了一个路由器，**它不在运行时里**：

```js
const router = createRouter(nav, {
  '/': () => vc,
  '/list': () => makePage({ … }),
  '/detail/:id': (params) => makePage({ heading: '详情 #' + params.id, … }),
}, '/');

router.push('/detail/1');
router.back();
router.onChange((path, depth) => …);
```

这是两层 API 分工的第一个实证：**运行时只裸暴露 `UINavigationController`，「路由」这层抽象 JS 自己搭得出来**，七十行，不需要运行时帮忙。

### 它的关键设计和所有权镜像同构

**原生栈是真相。** 返回按钮和左滑返回**都不经过 router**——用户的手指直接作用在 UIKit 上。所以 router 不能自己记一份权威的栈，只能在 `didshow` 里按 `nav.viewControllers.length` **收缩**自己那份 path 栈：

```js
nav.addEventListener('didshow', () => {
  while (paths.length > nav.viewControllers.length) paths.pop();
  …
});
```

和 `ownAll`「按原生真相整层重建」是同一个道理，也是同一个理由：**JS 侧记的任何一份影子状态，都必须能从原生的真相重新对齐。**

实测走查（真实点击 + 真实左滑）：

```
点「进入路由 →」  → /list      （栈深 2）
点「打开 #1」      → /detail/1  （栈深 3）
左滑              → /list      （栈深 2）
```

### 撞出来的崩溃：窗口根不能当子控制器

第一版 demo 是 `new UINavigationController(vc)`——把现有的根页面包起来。**App 当场死掉**：

```
*** Terminating app due to uncaught exception 'UIViewControllerHierarchyInconsistency',
reason: 'adding a root view controller as a child of view controller:<UINavigationController>'
```

两件事都要修：

1. **顺序**：先 `win.rootViewController = nav`（空栈），再 `nav.pushViewController(vc)`。那时 `vc` 已经不是根了
2. **不该崩**：这是调用方写错，不该打死 App。按[约束激活](auto-layout.md)那条判据，在 `pushViewController`、`setViewControllers` 和构造函数三处 `@try/@catch`，转成 `TypeError`

顺带发现构造这条通道**没有 `error` 出参**，所以构造失败只能返回空。原来 JS 侧是「拿不到句柄就什么都不做」，于是得到一个没有句柄的空壳，之后每碰一次都报「还没连接到场景」——真正的原因在构造那一步，完全看不出来。改成**建不出来就当场抛**。

### 一条自己坑自己的「回归用例」

想给上面那条坑补个回归，第一版写成：

```js
win.rootViewController = nav;
nav.pushViewController(vc, { animated: false });
try { new UINavigationController(vc); } catch { /* 期望抛 */ }
```

**它没抛，而且把 demo 搞坏了**——那时 `vc` 已经不是窗口根而是 `nav` 的子控制器，UIKit 允许把它**转移**给另一个导航控制器。于是 `vc.view` 连同整棵视图树被端到一个不在任何窗口里的导航控制器下，屏幕上什么都不剩，连带 `scroll` 的动画断言也挂了（不在窗口里的 scroll view 没有逐帧动画）。

回归用例要放在**重新挂根之前**——那一刻 `vc` 才真的是窗口的根。


## 5b：导航条上的东西

### 一个会段错误的所有权约定

`UIBarButtonItem.systemItem('add')` 第一次跑直接 **SIGSEGV，崩在 `objc_retain` 里**：

```
objc_retain
NacreRuntime.mm:576            ← host.retain_native
Engine.cpp:398 WrapNative
Engine.cpp:725 NativeClassCall
```

原因是我写了：

```objc
return {(__bridge void*)[[UIBarButtonItem alloc]
            initWithBarButtonSystemItem:systemItem target:nil action:nil],
        "UIBarButtonItem"};
```

**`__bridge` 不转移所有权。** 自己 `alloc` 出来的对象是 ARC 持有的 +1，出了这条语句就被放掉，`WrapNative` 再去 retain 就是野指针。

**两条通道的约定本来就不一样**，这是关键：

| 通道 | 怎么还对象 |
| --- | --- |
| `ConstructNative` | 末尾统一 `return {(void*)CFAutorelease(CFBridgingRetain(object)), className}` |
| `CallClassObjectMethod` | 各分支直接 `return {(__bridge void*)…}` |

后者一直是对的，因为此前所有分支返回的都是 **UIKit 自己造好、已经进了自动释放池**的对象（`buttonWithType:`、`fontWithName:`、`flexibleSpaceItem`）。`__bridge` 对它们安全。**`alloc` 出来的那一类是第一次出现。**

> 规矩记下来：**在类方法通道里自己 `alloc` 的对象必须 `CFAutorelease(CFBridgingRetain(…))`；只有 UIKit 返回的自动释放对象才能直接 `__bridge`。** `Engine.h` 上那句「宿主必须保证返回的对象活到调用方 retain 为止」说的就是这件事，但它写在 `construct_native` 旁边，类方法这条通道容易漏看。

### `vc.title` 和 `navigationItem.title` 是单向的

两条断言都是**预判错了才测出来的**：

| 做什么 | 结果 |
| --- | --- |
| `vc.title = '首页'` | `navigationItem.title` → `'首页'`（透下去了） |
| `navigationItem.title = '改过的'` | **`vc.title` 还是 `'首页'`** |
| `navigationItem.title = null` | **就是 `null`，不回落到 `vc.title`** |
| 再 `vc.title = '首页'` | `navigationItem.title` → `'首页'`（又透下去） |

所以它们是两份存储，`vc.title` 的 setter 会写穿到 `navigationItem`，而 `navigationItem` 的 setter 只管自己。一旦直接写过 `navigationItem.title`，它就彻底独立了。

结论写进 [API 文档](../api/ui-bar-button-item.md)：**只用一边**。

### 第二个带别名的枚举

`UIBarButtonItemStyleDone = UIBarButtonItemStyleProminent`，和 `UIStackViewAlignment` 的 `Top = Leading` 同构。[有序 pairs 那套](enums.md)原样复用，主名取 `prominent`（头文件里 `Done` 是被赋值的那一侧）。

> 两次都撞上，说明别名在 UIKit 里不是个例。**`NACRE_ENUM_MAP` 那个宏的反查用无序字典，碰上别名就会给出不确定的答案**——以后新加枚举，先扫一眼有没有 `= 另一个值` 的写法。

### `UIBarItem` 这个抽象基类加了

`UIBarButtonItem` 在 ObjC 里继承 `UIBarItem`，`title` / `image` / `isEnabled` / `tag` 四个属性都在基类上。虽然 `UIBarItem` 自己不能构造（JS 侧构造直接抛），还是把它建成了一个类——`UITabBarItem` 将来继承同一个基类，那时这四个属性不用重写一遍。


## 5c：模态呈现

### `call_async` 补了对象参数

`presentViewController:animated:completion:` 是第一个**既异步、参数里又有原生对象**的方法。原来的 `call_async` 只有 `args_json`，没有 `arg_ptrs`：

```cpp
std::function<void(void* ptr, const std::string& name,
                   const std::string& args_json, int call_id)> call_async;
```

之前的用户（`openURL` 收字符串、`prepareForDisplay` 无参、`prepareThumbnailOfSize:` 收结构体）都不需要。补成和 `call_method` 一样的形状——`args_json` 里留 `null`，指针按同样的下标在 `arg_ptrs` 里。

### `presentationController` 要等呈现才存在

delegate 挂在 `vc.presentationController` 上，而那个对象**要开始呈现才有**。所以 JS 在 `present` 之前订阅时装不上。

做法是把订阅状态记在 **VC** 上（关联对象），装 delegate 这件事在两处各做一次：

- JS 订阅时（已经在呈现中就立刻装）
- `present` 时（`presentViewController:` 一调用 `presentationController` 就有了，不用等动画跑完）

### 又一次「同步返回值 → 预先声明的状态」

`presentationControllerShouldDismiss:` 要同步返回 BOOL。**没做**——UIKit 自己已经给了状态版本：`isModalInPresentation`。

这是[那条规则](../project.md#屏幕方向方案已定未实现)的第二次应用（第一次是屏幕方向）。两次都说明：**UIKit 里「要同步回答的问题」往往同时存在一个属性版本**，先找那个，找不到才需要 M1b。

### 三条实测

| | 结果 |
| --- | --- |
| `modalPresentationStyle` 的默认值 | 头文件写 `Automatic`，但**读出来是解析后的具体样式**，实测 `'formSheet'`。别拿它和 `'automatic'` 比 |
| `presentingViewController` | 从导航控制器的子页面呈现，它是**那个导航控制器**，不是发起者。`presentedViewController` 那一侧倒是记在发起者身上 |
| 程序调用 `dismiss()` | **三条事件一个都不发**（实测 `[]`）。那几个 delegate 只管用户发起的关闭 |

真实交互验过：向下拖 → `willdismiss` → `diddismiss`；打开 `isModalInPresentation` 再拖 → 只有 `dismissattempted`，卡片不动。

### 给基类加订阅钩子的连带效应

给 `UIViewController` 加 `[kSubscribe]` 之后，验收用例当场挂了一段——GC 那段里有一行：

```js
ghost.addEventListener('nav-probe', () => {});
```

以前 `UIViewController` 没有订阅钩子，这就是个**纯 JS 的监听器**，随便起什么名字都行。加了钩子之后它要过桥，名字不认识就抛 `TypeError`，而这一抛发生在 `sceneconnect` 的回调里，**把后面所有步骤都打断了**。

> 这是一条真实的限制，不是 bug：**原生类上只能用它自己认识的事件名。** 好处是事件名打错会当场报（和枚举写错一个待遇）；坏处是 Web 里合法的「在任意 EventTarget 上挂自定义事件」在原生类上做不到。
>
> 还有一个连带：`UINavigationController` 覆写了这个钩子，所以**一个被模态呈现的导航控制器收不到关闭事件**——它那一侧只认导航事件。要修得让订阅**按事件名分流而不是按类分流**。两条都记进 TODO。


## 父子控制器

`addChildViewController:` 一组是纯粹的方法和属性，不需要回调，所以直接暴露。任何 `UIViewController` 都认（`ContainerCallMethod`，在方法分发里排在导航那一支后面——导航控制器也是 `UIViewController`，它自己的方法要先认走）。

### 成环会崩，而且接不住

```js
parent.addChildViewController(parent);
```

UIKit **不检查**这个，照加不误。之后任何沿着父链往上找的调用都会无限递归，实测崩溃报告是：

```
Thread stack size exceeded due to excessive recursion
-[UIViewController _ancestorViewControllerOfClass:allowModalParent:]
```

这是栈溢出，不是 ObjC 异常，宿主入口那层 `@try` 接不住，App 直接没了。把祖先加成子控制器也是同一个结果。

所以原生层在加之前自己沿父链走一遍，碰到要加的那个对象就填报错。这是校验不是调度，和 `insertSublayer:atIndex:` 拒掉负下标是同一类。

写验收的时候就是这么发现的：那一句本来写的是「实测：把自己加成自己的子控制器 → ？」，想看 UIKit 抛什么。

### 持有边

| 原生 | JS 侧 | 什么时候动 |
| --- | --- | --- |
| 父控制器 strong 持有子控制器 | `parent` → `childViewControllers` | `addChildViewController` 记；`removeFromParentViewController` 解除；读 `childViewControllers` 时按原生真相整层重建 |
| `parentViewController` 是 weak 回边 | 原来就有，`nativeGetOwned` | — |

`addChildViewController` 有一个「先从原来的父控制器那边摘下来」的隐含动作，所以调用前先读一次它现在的父控制器，调完去那边解除。和 `addSubview` 处理「视图换父视图」是同一个写法。

系统不会自己增删子控制器，所以不需要像导航栈那样常驻一个内部事件。

`willMoveToParentViewController:` 和 `didMoveToParentViewController:` 收一个对象参数但不建立持有，登记在 `check-api.sh` 的白名单里。

### `additionalSafeAreaInsets` 什么时候读得出来

实测：页面还没进窗口时，`view.safeAreaInsets` 四边都是 0，写了 `additionalSafeAreaInsets` 也一样。进了窗口、布局过一轮之后是 44（写的就是 44；那个子页面不贴屏幕边，系统那一份是 0）。约束到 `safeAreaLayoutGuide` 的内容不用管这件事，布局时自己到位。

### 没做的

`transitionFromViewController:…` 的动画块是同步执行的，卡在 M1b。`beginAppearanceTransition:` 一组没有意义——它们的作用是触发子页面的 `viewWillAppear:`，而那是覆写点，JS 现在听不到。

---

← 返回[实现原理](README.md) ・ [包装机制](wrapper.md) ・ [API 文档](../api/ui-navigation-controller.md)
