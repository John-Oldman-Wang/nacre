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

代价是已知的那个洞：加了闸之后 `class MyPage extends UIViewController {}` **建不出原生对象**。而「用自己的页面类」恰恰是最可能的用法，所以这个洞从「理论缺陷」变成了「实际挡路」。

> **正经的修法不是继续加闸，是把构造挪出构造函数**：让最底下那个类按 `new.target` 的真实类名去建，而不是每个类各自硬编一个类名。那样一次 `constructNative` 都不会重复，`new.target` 闸整套可以撤掉，ES 子类也自然拿到对的原生对象。代价是每个类的构造参数不一样（`UIWindow` 收场景、`UIStackView` 收数组、`UINavigationController` 收根页面），要重新组织一次。这件事和「JS 子类化原生类」是同一个 TODO，一起做。

## 验收用例为什么放在第二个窗口里

主窗口上已经堆了十几步的东西，把导航塞进去要么盖住别人、要么被别人盖住（第一次放在 y=300 那条带上，正好压在滚动列表的上沿）。

所以给它**一个自己的 `UIWindow`**，放在右上角那块空区（`CGRect(248, 130, 156, 150)`）：

- 实测 **UIKit 认自定义 frame**，不会把场景里的窗口撑满屏幕
- 只设 `isHidden = false`，**不调 `makeKeyAndVisible`**——可见就能收触摸，没必要把 key 从主窗口抢走（抢了会给主窗口发一串 `resignkey`）

真实的返回按钮点击验过：点一下，`didshow` 报「首页」，栈深从 2 变 1。

---

← 返回[实现原理](README.md) ・ [包装机制](wrapper.md) ・ [API 文档](../api/ui-navigation-controller.md)
