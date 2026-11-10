# 原生类：怎么构造、能不能继承、能不能挂东西

iOS 的类按 ObjC 类名裸暴露在全局。但不是每个类都能 `new`，而且**都不能继承**。

```js
const label = new UILabel();          // 可以
const color = UIColor.redColor;       // 只能这样拿，new 不出来
class MyLabel extends UILabel {}      // 构造时抛 Illegal constructor
```

## 三组类

判据是 **ObjC 侧有没有可用的 `init`**。

| | 怎么拿到 | 有哪些 |
| --- | --- | --- |
| **可构造** | `new X(…)` | `UIView` `UIControl` `UIButton` `UILabel` `UIImageView` `UIScrollView` `UIStackView` `UIViewController` `UINavigationController` `UIWindow` `UIBarButtonItem` `UILayoutGuide` `Blob` |
| **抽象基类** | 拿不到，只作为继承链的一环 | `NSObject` `UIResponder` `UIScene` `UIBarItem` |
| **工厂专造** | 静态方法或读属性 | `UIColor` `UIFont` `UIImage` `CALayer` `NSLayoutConstraint` 和四个锚点类 `UINavigationItem` `UIWindowScene` `UISceneSession` |

```js
UIColor.systemBlueColor                 // 静态属性
UIFont.systemFontOfSize(17)             // 静态方法
view.layer                              // 读属性
```

## 不能继承

```js
class MyPage extends UIViewController {}
new MyPage();
// TypeError: Illegal constructor: MyPage extends UIViewController,
//            but subclassing native classes is not supported yet
```

**为什么**：覆写一个原生方法要运行时动态生成 ObjC 子类并把调用转发回 JS，这件事还没做（见[项目说明](../project.md)的 M2）。在那之前子类的 `super()` 建不出原生对象，以前它会**静默**给一个空壳，等到第一次读属性才在几十行之外抛「还没连接到场景」——指向完全无关的地方。现在在构造那一刻说清楚。

**错误指不到 `class` 那一行**：JS 没有「拒绝被继承」的钩子——`extends` 只是读 `prototype` 再 `setPrototypeOf`，没有可以挂的陷阱。最早只能在 `new` 的时候抛，所以错误信息把子类名和基类名都点出来，让它指得回去。

**TypeScript 也挡不住**：它没有 `final`，而「可以 `new`、不可以 `extends`」两件事只能一起开或一起关。所以 `class MyPage extends UIViewController {}` 在编辑器里是绿的。工厂专造的类是例外——它们在类型定义里是 `private constructor()`，连 `extends` 一起挡住了。

**要自己的页面类就用组合**：

```js
function makeSettingsPage() {
  const page = new UIViewController();
  page.title = '设置';
  // 往 page.view 上挂东西
  return page;
}
```

## 可以挂自定义属性

原生对象的 JS 包装是普通对象，往上挂东西是允许的：

```js
view.myData = { id: 42 };
view.myData.id;      // 42
```

**保证的边界**：

> 包装只要还能从 `application` 走到，挂在它上面的东西就在。

挂进视图树、导航栈、或者写进某个属性的对象都满足这条——运行时有一张所有权镜像替你持有它们。反过来，**一个谁都不引用的包装会被回收**，下次从原生读回来是个新包装，挂的东西没了。

```js
const box = new UIView();
box.tag = 'x';
parent.addSubview(box);        // 进树了 → 'x' 一直在
// 不进树又丢掉 box 这个变量 → 可能丢
```

> 这和 Chrome 遇到的是同一个问题。它的解法见[实现原理](../internals/wrapper.md)。

**两个已知的坑**，都是静默的：

| | |
| --- | --- |
| 属性名拼错了不报错 | `view.backgroundColour = 'red'` 悄悄挂在包装上，什么都不会发生 |
| 没有所有权边时悄悄丢 | 上面那条 |

## 三种「没有原生对象」，话术不同

| 写法 | 报什么 | 什么意思 |
| --- | --- | --- |
| `class X extends UIView {}` + `new X()` | `Illegal constructor: X extends UIView, …` | 继承还没做 |
| `new UIColor()` | `Illegal constructor: UIColor is created by the runtime, not by new` | 这个类只能由运行时建 |
| `new NSObject()` | `Illegal constructor: NSObject cannot be constructed` | 抽象基类 |
| `Object.create(UIView.prototype).frame` | `frame: Illegal invocation` | 原型链对，但没走过任何构造函数 |
| `new UIWindow()` 之后读属性 | `rootViewController: this object is not connected to a scene yet` | **合法状态**，绑上场景就好了 |

`Illegal invocation` 这一条和 Chrome 一致：那边 `Object.create(HTMLButtonElement.prototype).disabled` 报的就是 `TypeError: Illegal invocation`。原因一样——对象能不能用，看的是**内部状态**在不在，不是原型链长什么样。

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[[UILabel alloc] init]` | `new UILabel()` |
| `[UIColor redColor]` | `UIColor.redColor` |
| `[UIFont systemFontOfSize:17]` | `UIFont.systemFontOfSize(17)` |
| `@interface MyPage : UIViewController` | 还不行，见上 |

## 还没做

| | |
| --- | --- |
| 继承原生类 | 要能动态生成 ObjC 子类并把覆写转发回 JS |
| 覆写 `viewDidLoad` / `layoutSubviews` / `drawRect:` / `sizeThatFits:` | 同上 |
| 属性名拼错了报错 | 要禁止扩展，而那和「可以挂自定义属性」冲突 |

---

← 返回 [API 文档](README.md) ・ [实现原理](../internals/wrapper.md)
