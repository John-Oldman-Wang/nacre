---
type: concept
status: partial
---

# 原生类

**原生类**表示 iOS 系统提供的类：视图（`UIView`）、文字标签（`UILabel`）、页面（`UIViewController`）、图层（`CALayer`）等。它们是全局的类，不需要导入，名字和 iOS 里的类名相同。原生类的一个 JS 对象对应系统里的一个对象：写它的属性、调它的方法，改变的是系统里那个对象，界面随之变化。

所有原生类有同一套规则：怎么得到对象、不能继承、可以往对象上加自己的属性、对象什么时候被回收、参数传错了会怎样。这些规则写在这一页，各个类的文档不再重复。

运行时自己定义的类（`URL`、`Request`、`WebSocket`、`Blob` 等）和结构体（`CGRect` 等，见[结构体](structs.md)）不是原生类，这一页的规则不全适用于它们。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  const label = new UILabel();                 // 用 new 构造
  label.frame = { x: 20, y: 100, width: 300, height: 30 };
  label.text = 'Hello';
  label.font = UIFont.systemFontOfSize(20);    // 字体不能 new，由静态方法给出
  page.view.addSubview(label);

  console.log(label instanceof UIView);        // 继承关系和 iOS 一致
  console.log(label.superview === page.view);  // 同一个系统对象是同一个 JS 对象
});
```

**效果**

- 屏幕上有一行 20 pt 的文字 `Hello`。
- 控制台输出两个 `true`。

下面各节的例子沿用这里的 `page` 和 `label`。

## 怎么得到一个对象

原生类按「怎么得到对象」分成三组。每个类属于哪一组，写在它自己的文档里。

| 组 | 怎么得到 | 例子 |
| --- | --- | --- |
| 可以构造的 | `new X(…)` | `UIView`、`UILabel`、`UIButton`、`UIImageView`、`UIScrollView`、`UIStackView`、`UITextField`、`UIWindow`、`UIViewController`、`UINavigationController`、`UITabBarController`、`CALayer`、`CAShapeLayer`、`CAGradientLayer`、`CABasicAnimation`、`UIBezierPath`、`UILayoutGuide`、`UIBarButtonItem`、`UITapGestureRecognizer` |
| 只由运行时创建的 | 读某个属性，或调某个静态方法 | `UIColor`、`UIFont`、`UIImage`、`NSLayoutConstraint`、`UIWindowScene`、`UINavigationItem`、`UITraitCollection`、`UIDevice`、`UIPasteboard` |
| 基类 | 得不到。它们只是别的类的父类 | `NSObject`、`UIResponder`、`UIScene`、`UIBarItem`、`UIGestureRecognizer`、`CAAnimation` |

```js
const font = UIFont.systemFontOfSize(17);     // 静态方法
const layer = label.layer;                    // 读属性
const device = UIDevice.currentDevice;        // 静态属性

console.log(font instanceof UIFont, layer instanceof CALayer, device instanceof UIDevice);
```

**结果**

- 输出 `true true true`。

对后两组的类写 `new` 会抛 `TypeError`，报错信息见[三种「没有原生对象」](#三种没有原生对象话术不同)。类型检查也会在 `new` 的位置报错。

基类可以用在 `instanceof` 的右边：`label instanceof UIResponder` 是 `true`。

## 不能继承

原生类不能被继承。`class` 声明本身不报错，报错发生在 `new` 的时候：

```js
class MyPage extends UIViewController {}

try {
  new MyPage();
} catch (err) {
  console.log(String(err));
}
```

**结果**

- 输出 `TypeError: Illegal constructor: MyPage extends UIViewController, but subclassing native classes is not supported yet`。
- 没有创建出任何对象。

读者此刻关心的几件事：

- **哪些类不能继承。** 全部原生类，包括 `UILabel`、`UIStackView` 这类没有子类的类。
- **编辑器会不会提前报错。** 对可以构造的类不会：`class MyPage extends UIViewController {}` 和 `new MyPage()` 都能通过类型检查，错误只在运行时出现。对只由运行时创建的类（如 `UIColor`）会，类型检查在 `extends` 处报错。
- **报错指向哪里。** 指向 `new MyPage()` 那一行，不是 `class` 那一行。报错信息里写出了子类和父类的名字，可以按名字找到 `class` 声明。
- **为什么不能。** 继承系统的类，目的通常是覆写系统会调用的方法，比如布局时、绘制时、页面出现时调用的方法。运行时目前不能把系统的这些调用交给 JS 的方法，见[还不能做的](#还不能做的)。

### 推荐的做法：用函数组合

需要「一种自己的视图」或「一种自己的页面」时，写一个函数：在函数里构造原生对象，配置好，返回它。需要额外的数据和方法时，返回一个包含原生对象的普通对象。

```js
/** @param {string} title */
function makeCard(title) {
  const view = new UIView();
  view.backgroundColor = 'secondarySystemBackground';
  view.layer.cornerRadius = 12;

  const heading = new UILabel();
  heading.frame = { x: 16, y: 12, width: 200, height: 24 };
  heading.text = title;
  view.addSubview(heading);

  let taps = 0;
  return {
    view,
    /** @param {string} text */
    setTitle(text) {
      heading.text = text;
    },
    countTap() {
      taps += 1;
      return taps;
    },
  };
}

const card = makeCard('余额');
card.view.frame = { x: 20, y: 160, width: 240, height: 80 };
page.view.addSubview(card.view);
card.setTitle('可用余额');
```

**效果**

- 屏幕上有一张圆角卡片，里面的文字是「可用余额」。

这种写法能做到继承想做的三件事：

| 想做的事 | 写法 |
| --- | --- |
| 给对象加自己的数据 | 函数里的局部变量（上面的 `taps`），或返回对象上的字段 |
| 给对象加自己的方法 | 返回对象上的方法（上面的 `setTitle`） |
| 复用同一套配置 | 多次调用这个函数 |

需要把 `card` 交给接受视图的 API 时，传 `card.view`。

只需要配置、不需要额外的数据和方法时，函数直接返回原生对象：

```js
/** @param {string} title */
function makeSettingsPage(title) {
  const settings = new UIViewController();
  settings.title = title;
  settings.view.backgroundColor = 'systemBackground';
  return settings;
}
```

**效果**

- 调用 `makeSettingsPage('设置')` 得到一个标题是「设置」的页面，可以交给导航控制器显示。

## 可以挂自定义属性

可以往原生类的对象上添加自己的属性，用来把一份数据和一个界面对象关联起来。之后从别处拿到同一个对象时，属性还在：

```js
const row = new UIView();
/** @type {any} */ (row).orderId = 42;
page.view.addSubview(row);

const again = page.view.subviews[page.view.subviews.length - 1];
console.log(again === row, /** @type {any} */ (again).orderId);
```

**结果**

- 输出 `true 42`。

`/** @type {any} */ (row)` 是写给类型检查看的。类型定义里 `UIView` 没有 `orderId` 这个属性，直接写 `row.orderId = 42` 能运行，但类型检查会报错。这是有意保留的：同一条检查负责发现拼错的属性名，见[属性名拼错了不报错](#属性名拼错了不报错)。

自定义属性不要和类已有的属性重名。

### 推荐的写法

自定义属性多、或者要在很多地方读时，声明一次类型，之后就不用每次转型：

```js
/** @typedef {UIView & { orderId?: number }} OrderRow */

const orderRow = /** @type {OrderRow} */ (new UIView());
orderRow.orderId = 42;
console.log(orderRow.orderId);
```

**结果**

- 输出 `42`。

数据只在创建它的那段代码里使用时，优先用[函数组合](#推荐的做法用函数组合)里的局部变量，不需要挂到对象上。挂属性适合的情况是：代码在别处拿到了这个界面对象（比如事件的 `target`、父视图的 `subviews`），需要从它找回对应的数据。

### 挂上去的属性会不会丢

属性挂在 JS 对象上。只要这个 JS 对象还在，属性就在。JS 对象在下面任意一种情况下都会一直保留：

- 代码里还有变量、闭包或别的对象引用着它。
- 它是界面的一部分：加进了父视图、在导航栈里、被模态显示着，或者被赋给了另一个保留着的对象的属性（比如页面的 `view`、窗口的 `rootViewController`）。

所以挂在界面上的视图、页面上的属性不会丢，不需要另外保存引用。

会丢的情况只有一种：对象既不在界面里，代码里也没有任何引用。这时 JS 对象会被回收。之后再通过某个 API 得到系统里的同一个对象，得到的是一个新的 JS 对象，原来挂的属性不在上面：

```js
/** @type {any} */ (UIColor.systemBrownColor).note = 'brand';
// 这里没有保存 UIColor.systemBrownColor，也没有把它交给任何界面对象。
// 一段时间之后再读：
console.log(/** @type {any} */ (UIColor.systemBrownColor).note);
```

**结果**

- 可能输出 `brand`，也可能输出 `undefined`，取决于这期间 JS 对象有没有被回收。

要让这种对象上的属性保留，把对象存进一个自己保留着的变量。

## 属性名拼错了不报错

因为对象上可以添加任意属性，写错的属性名在运行时不会报错。它被当成一个新的自定义属性：

```js
// @ts-expect-error 没有 backgroundColour 这个属性，类型检查会报错
label.backgroundColour = 'systemRed';
console.log(label.backgroundColor);
```

**结果**

- 标签的背景色没有变化，输出的仍是原来的值。
- 运行时没有任何报错或警告。

**这类错误靠类型检查发现。** 开启类型检查后，上面那一行在编辑器里报：

```
Property 'backgroundColour' does not exist on type 'UILabel'. Did you mean 'backgroundColor'?
```

类型检查能发现、运行时也会报错的几类问题对比如下：

| 写法 | 类型检查 | 运行时 |
| --- | --- | --- |
| 属性名拼错：`view.backgroundColour = 'red'` | 报错，并提示正确的名字 | **不报错，也不生效** |
| [枚举](enums.md)取值写错：`view.contentMode = 'scaleAspectFitt'` | 报错，并提示正确的取值 | 抛 `TypeError` |
| 写只读属性：`view.superview = other` | 报错 | 抛 `TypeError` |
| 自定义属性：`view.orderId = 42` | 报错，要按上一节的写法转型 | 正常 |

第一行是只有类型检查能发现的错误，所以**建议所有项目开启类型检查**。配置方法见[建一个自己的 App](../guides/your-own-app.md)：安装 `@nacre/types`，在 `tsconfig.json` 里打开 `checkJs`。

## 对象什么时候被回收

原生类的对象不需要手动释放。不再被任何地方使用的对象，连同它对应的系统对象，会被自动回收。

「被使用」包括两种：代码里有引用，或者它是界面的一部分。所以界面上的对象不需要为了让它存在而保存到变量里：

| 对象 | 保留到什么时候 |
| --- | --- |
| 连接到场景的窗口 | 场景存在期间 |
| 窗口的根页面、导航栈里的页面、被模态显示的页面 | 被替换、弹出或关闭 |
| 加进父视图的视图、加到视图上的手势识别器 | 从父视图移除，或父视图不再保留 |
| 赋给属性的字体、图片、颜色对象 | 属性被改成别的值，或所属对象不再保留 |
| 调过 `addToRunLoop()` 的 `CADisplayLink` | 调用 `invalidate()`，或用 `removeFromRunLoop()` 从加入过的每个模式里移除 |
| 打开着的 `WebSocket` | 连接关闭 |
| 没有加到任何地方的对象 | 代码里最后一个引用消失 |

三条容易想错的地方：

- **加事件监听不会让对象保留。** 一个没有加进界面、代码里也没有引用的按钮，即使加了监听，也会被回收，监听一起消失。反过来，界面上的按钮即使代码里没有保存它，监听也一直有效，点击时照常收到事件。
- **监听的回调引用了对象自己，不妨碍回收。** 不需要在离开页面时逐个 `removeEventListener`。
- **页面被用户用返回手势弹出、模态页被用户向下拖走之后，不再被导航栈和呈现它的页面保留。** 代码里没有别的引用时，它和它的视图、视图上的监听一起被回收。

如果一个对象的 JS 对象已经被回收，系统里的对象却还在产生事件，运行时在控制台输出一条警告，事件不会送达任何监听：

```
[Nacre] CADisplayLink fired "tick" after its JS wrapper was collected; its listeners are gone and this event was dropped. Keep a reference to the object, or report this if it is still on screen.
```

看到这条警告时，把这个对象保存到一个保留着的变量里。如果它明明在界面上，这是运行时的缺陷。

场景被系统销毁之后界面对象的回收，见 [`UIWindowScene`](ui-window-scene.md)。

## 同一个系统对象是不是同一个 JS 对象

是。只要 JS 对象还保留着，通过任何途径得到系统里的同一个对象，得到的都是同一个 JS 对象，可以用 `===` 比较：

```js
const child = new UIView();
page.view.addSubview(child);

console.log(child.superview === page.view);
console.log(page.view.subviews.includes(child));
console.log(UIColor.systemRedColor === UIColor.systemRedColor);
```

**结果**

- 输出三个 `true`。

事件对象的 `target` 也是同一个对象，所以在事件回调里可以读到之前挂在它上面的自定义属性。

两类值不是这样：

- [结构体](structs.md)每次读出来是新的实例，不能用 `===` 比较。
- [颜色](ui-color.md)属性读出来是字符串。

## 参数传错了会怎样

属性和方法的参数按它声明的类型处理。数、布尔、字符串会自动转换；原生对象和枚举不转换，类型不对就抛 `TypeError`。抛错时这次写入或调用完全不生效，属性保持原值。

| 要求的类型 | 怎么处理 | 抛 `TypeError` 的情况 |
| --- | --- | --- |
| 数 | 按 `Number()` 转换。`'0.5'` 是 0.5，`true` 是 1，`null` 是 0 | 转换结果不是有限的数：`undefined`、`'abc'`、`NaN`、`Infinity`、对象 |
| 整数（下标、个数） | 先按数转换，再去掉小数部分。`3.9` 是 3，`-3.9` 是 -3 | 同上 |
| 布尔 | 按 JS 的真假值。`1`、`'false'`、`{}` 是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 是 `false` | 没有 |
| 字符串 | 按 `String()` 转换，`5` 是 `'5'`。`null` 和 `undefined`：属性允许为空时得到 `null`，不允许时得到空字符串 | 没有 |
| 原生对象 | 不转换 | 不是要求的那个类。属性和可选参数可以给 `null` |
| [枚举](enums.md) | 不转换 | 不在取值表里 |
| [结构体](structs.md) | 实例或带同名字段的普通对象 | 少字段，或字段不是有限的数 |
| [颜色](ui-color.md) | 字符串或 `UIColor` 对象 | 不抛。写错时输出警告，属性保持原值 |
| options 对象的成员 | 值是 `undefined` 的成员视为没有给。整个 options 给 `null` 或 `undefined` 视为空对象 | 必填的成员没有给 |

```js
const view = /** @type {any} */ (new UIView());

view.alpha = '0.5';
console.log(view.alpha);

view.isHidden = 'false';
console.log(view.isHidden);
view.isHidden = false;

try {
  view.alpha = undefined;
} catch (err) {
  console.log(String(err));
}
console.log(view.alpha);

try {
  view.addSubview(UIFont.systemFontOfSize(12));
} catch (err) {
  console.log(String(err));
}

try {
  label.font = /** @type {any} */ ('Helvetica');
} catch (err) {
  console.log(String(err));
}
```

**结果**

- 第一段输出 `0.5`。
- 第二段输出 `true`：字符串 `'false'` 不是空字符串，按真假值是 `true`。
- 第三段输出 `TypeError: alpha must be a finite number, got undefined`，接着输出 `0.5`，原值没有变。
- 第四段输出 `TypeError: addSubview needs a UIView`，没有添加任何子视图。
- 第五段输出 `TypeError: font needs a native object or null, got "Helvetica"`，标签的字体没有变。

**推荐按声明的类型传值，不依赖自动转换。** 类型定义没有随着运行时放宽：`view.alpha = '0.5'` 能运行，但类型检查会报错。上面的例子要先转成 `any` 才写得出来。自动转换的作用是让来源不确定的值（比如从 JSON 里读出的字符串）不至于出错，而 `'false'` 变成 `true` 这类结果通常不是想要的。

数值超出允许范围（比如负的点按次数）是另一类错误，由各个 API 自己检查，见各类的文档。

系统自己拒绝的调用也是 `TypeError`，报错信息里带着系统给的原因：

```js
const loner = new UIView();
try {
  loner.addSubview(loner);
} catch (err) {
  console.log(String(err));
}
```

**结果**

- 输出以 `TypeError: addSubview: raised NS` 开头的一行，里面有系统的说明 `Can't add self as subview`。
- 没有添加子视图。`loner` 之后可以照常使用，App 不会退出。

## 三种「没有原生对象」，话术不同

JS 对象背后没有对应的系统对象时，报错按原因分成几种。前三种发生在 `new` 的时候：

| 写法 | 报错 | 原因 |
| --- | --- | --- |
| `class X extends UIView {}` 之后 `new X()` | `Illegal constructor: X extends UIView, but subclassing native classes is not supported yet` | 原生类不能继承，见[不能继承](#不能继承) |
| `new UIColor()` | `Illegal constructor: UIColor is created by the runtime, not by new` | 这个类只由运行时创建，见[怎么得到一个对象](#怎么得到一个对象) |
| `new NSObject()` | `Illegal constructor: NSObject cannot be constructed` | 基类。`UIResponder`、`UIScene` 的报错相同；`UIBarItem` 和 `UIGestureRecognizer` 的报错是 `… is abstract; construct … instead`，写出了该构造哪个类 |

后两种发生在使用对象的时候：

| 写法 | 报错 | 原因 |
| --- | --- | --- |
| `Object.create(UIView.prototype).frame` | `frame: Illegal invocation` | 对象不是由构造函数或运行时创建的，只是原型相同。把它当参数传给别的方法时，报错是 `… has no native object yet, so it cannot be passed as an argument` |
| `new UIWindow()` 之后读 `rootViewController` | `rootViewController: this object is not connected to a scene yet, so no native object exists` | **这不是写错了。** 不带参数构造的窗口要等写入 `windowScene` 之后才能使用，见 [`UIWindow`](ui-window.md) |

五种都是 `TypeError`。

## 与 iOS 原生写法的对照

| ObjC | JS |
| --- | --- |
| `[[UILabel alloc] init]` | `new UILabel()` |
| `[UIColor redColor]` | `UIColor.redColor`，或直接写字符串 `'red'` |
| `[UIFont systemFontOfSize:17]` | `UIFont.systemFontOfSize(17)` |
| `[view insertSubview:box atIndex:0]` | `view.insertSubview(box, { atIndex: 0 })` |
| `[view isKindOfClass:UIView.class]` | `view instanceof UIView` |
| `@interface MyPage : UIViewController` | 不支持，见[不能继承](#不能继承) |

方法名的对应规则：ObjC 方法名的第一段是 JS 的方法名，其余各段是 options 对象的键。

## 还不能做的

| 想做的事 | 对应的原生能力 |
| --- | --- |
| 继承原生类 | 定义 ObjC 子类 |
| 在页面出现、消失时执行代码 | 覆写 `viewWillAppear:`、`viewDidDisappear:` 等 |
| 在视图布局时执行代码、自己绘制视图的内容 | 覆写 `layoutSubviews`、`drawRect:`、`sizeThatFits:` |
| 属性名拼错时在运行时报错 | 没有对应的原生能力。用类型检查发现 |
| 使用没有文档的 iOS 类（`NSString`、`CLLocationManager` 等） | 全局只有文档里列出的类 |

## 参见

- [枚举](enums.md)：枚举取值的写法，写错时的报错。
- [结构体](structs.md)：`CGRect` 等值的写法，字段只读。
- [颜色](ui-color.md)：颜色写成字符串，写错时只警告。
- [`UIWindowScene`](ui-window-scene.md)：场景被销毁时界面对象的回收，以及为什么不要把界面对象保存到回调外面。
- [建一个自己的 App](../guides/your-own-app.md)：怎么配置类型检查。
- [实现原理](../internals/wrapper.md)：对象的保留和回收是怎么实现的。
- [参数转换](../internals/conversion.md)：转换规则的来源和实测记录。
