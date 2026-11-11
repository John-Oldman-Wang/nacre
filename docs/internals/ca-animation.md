# 动画

A6-1：`CABasicAnimation`、时间曲线、`CATransaction`、动画事件。

## 值的类型由 keyPath 决定，所以表只能放原生层

`fromValue` / `toValue` / `byValue` 在 ObjC 里是 `id`。放什么**由 keyPath 说了算**：`opacity` 要 `NSNumber`，`position` 要 `NSValue(CGPoint)`，`strokeColor` 要 `CGColorRef`，`path` 要 `CGPathRef`。桥本身不知道该做哪种转换。

判据和枚举是同一条：**只有原生层知道事实，而且查不到就能当场报错**。所以 `AnimKeyPathTable` 住在 `NacrePropsAnimation.mm` 里，收我们已经暴露的那些可动画属性。

两条取舍：

- **`frame` 不收。** 它在 Core Animation 里是从 `position` / `bounds` / `transform` 推出来的，不是独立的存储。Apple 明说别动画它。
- **`isHidden` 不收。** 布尔值动画没有意义。

### 通道怎么分

颜色和路径是原生对象，数字和结构体是标量，两种在桥上是两条不同的通道。分工定成这样：

| 谁决定 | 决定什么 |
| --- | --- |
| **JS** | 走哪条通道——它看得见值的形状（是不是字符串、是不是 `UIBezierPath`） |
| **原生** | 值配不配得上 keyPath——只有它有那张表 |

所以 JS 侧的 setter 先按形状挑通道，原生侧再按 keyPath 核一遍。两层都不多余：JS 挑错通道原生会报「需要一个颜色」，JS 挑对了但类型不配也会报。

读回来的时候 JS 先问对象通道，给 `null` 再问标量通道。对象通道对一个标量 keyPath 本来就不认领，所以这条路是确定的。

### keyPath 没设就赋值，抛

```
TypeError: set keyPath before toValue; the value's type depends on it
```

不这么做的话只剩「按值的形状猜」，而那在 keyPath 之后被改掉时会悄悄变错。报错比猜好。

## 三件被 check-api.sh 当场抓住的事

这一步是脚本第一次**连抓两处同类问题**，都是「为了少写几行，把名字藏进了变量」：

| 哪边 | 写法 | 后果 |
| --- | --- | --- |
| `nacre.js` | 把 `nativeGet(this, 'toValue')` 抽进 `animValue(anim, name)` 助手 | 三个名字在正则眼里消失，报「原生层有但 nacre.js 没有」 |
| `NacrePropsAnimation.mm` | 三个分支合成 `for (NSString* name in @[@"fromValue", …])` | 漏掉 `byValue`，报「nacre.js 有但原生层没有」 |

两处都改回**把名字写成字面量**。这和 A5-1 决定「枚举表不抽宏」是同一条取舍——**能被检查看见比少写几行重要**。区别是那次是人决定的，这次是脚本先发现的。

## 新加的两条引擎通道

| 通道 | 为什么原来没有 |
| --- | --- |
| `call_class_method` | 原来只有 `call_class_object_method`（返回原生对象）。`CATransaction.begin()` 不返回对象，`disableActions()` 返回布尔——「返回一个对象」和「返回一个值」在桥上是两种编码 |
| `EmitObjectEventWithJSON` | 原来事件负载只能是原生对象（导航的 `willshow` 带 viewController）。动画的 `stop` 要带一个布尔 |

第二条**不用动 JS 侧的 sink**：它本来就是 `defineField(event, field, payload)`，payload 是什么就挂什么。原生那边把 JSON 解开再传进去，sink 一视同仁。

事件带不带数据的判据没变：**那个信息在对象上读不读得到**。`finished` 读不到，所以必须带；滚动事件的位置读得到，所以不带。

## 动画事件的 trampoline

和控件、滚动那几个同构，但多两条别处没有的麻烦。

### `addAnimation:` 会拷贝，所以回调里的不是原来那个

头文件原话：动画在加进图层前被拷贝。于是 `animationDidStop:` 收到的 `anim` 是**那份拷贝**，指针和 JS 当初建的对象对不上，按它查包装会查到一个全新的包装（或者查不到）。

修法是 trampoline 自己记着原来那个对象，派发时派给它——JS 监听的本来就是它。

### `origin` 这条边为什么不能 strong

动画 **strong 持有** delegate（头文件里 `@property(nullable, strong) id <CAAnimationDelegate> delegate`，和 `UIScrollView.delegate` 的 weak 正好相反）。所以 trampoline 反过来再强持有动画就成环，两头都回收不掉。

所以它是 `weak`。另外还有一层保险：回调里先看 `types` 再碰 `origin`，而 `types` 非空意味着一条闭合的链——**JS 侧还有监听器 ⇒ `subscribed` 攥着那个包装 ⇒ 包装攥着句柄 ⇒ 原生对象活着**。

（中间一度改成 `unsafe_unretained`，理由是「`weak` 对 `CAAnimation` 不可靠」。那个理由见下，是错的，已经改回来。）

### 走错过一次：以为是 origin 丢了，其实是等太短

第一轮三条事件断言全挂，当时的判断是「`weak` 对 `CAAnimation` 不可靠，`origin` 变成了 nil」。**这个判断是错的**，而且在 trampoline 上白改了一轮。

打上诊断之后事实很清楚：

```
45.158  added key=quick  copyDelegate=<NacreAnimationDelegate>   ← 拷贝带着 delegate
45.909  didStart                                                  ← 晚了 751 ms
47.644  didStop finished=1                                        ← 2.49 秒后
```

`origin` 一直好好的，拷贝也带得住 delegate，回调全都来了——**是验收用例只等了 500 ms**。`weak` 没有任何问题，后来也验过。

实测的事实是：**动画要等主线程闲下来才开始跑。** 这一轮里 `addAnimation` 到 `didStart` 隔了 751 ms，因为那会儿主线程还在跑后面的验收段；`quick`（0.1 秒的动画）的 `stop` 到 2.49 秒才到。

所以验收改成**等事件到达再断言**，8 秒还没来就报未验证，而不是写死一个延迟——写死就是在赌一个我们控制不了的时序。[文件那条大写入](filesystem.md#这条断言只有单边有效)是同一个形状。

教训不是「该先打诊断」，而是**先打诊断再改代码**：那一轮如果先确认 `origin` 是不是 nil，就不会去动 trampoline。

## JSON 带不动 Infinity

`repeatCount = Infinity` 是 ObjC 里 `HUGE_VALF` 的对应写法，而且是无限循环的唯一写法。但 `JSON.stringify(Infinity)` 给的是 `null`，到原生变成 0——**写进去又不报错**，正是这个项目一路在消灭的那种错。

所以它在桥上是字符串 `'infinity'`，两头各换一次。JS 看到的类型还是 `number`，`repeatDuration` 同样处理。

这和枚举、哨兵常量（`spacing = 'system'`）是同一个套路：**JSON 表达不了的东西用字符串过桥，两边各自还原**。区别是那两个的字符串是 API 的一部分，这个纯粹是桥的实现细节，JS 开发者看不见。

## A6-2：关键帧、动画组、弹簧

### `values` 复用了 `toValue` 的分工，没有新机制

A6-1 把「值的类型由 keyPath 决定」这件事定在了原生层，`values` 直接套用：JS 按**第一个元素的形状**挑通道（颜色和路径走对象数组，数字和结构体走标量数组），原生**逐个**按 keyPath 核。

按首元素挑是安全的，因为一条动画的所有关键帧必须配同一个 keyPath，混着放本来就没意义——而且真混了原生会在第二个元素上报错。

**`locations` / `colors` 的动画仍然做不了**，那是另一件事：`toValue` 本身是个数组，需要再加一种「数组 of X」的取值类型。`CAKeyframeAnimation.values` 是「一串单值」，不是「一个数组值」。

### `path` 又是一次 CGPath 往返

和 `CAShapeLayer.path` 同一个形状：写进去取 `.CGPath`，读回来 `bezierPathWithCGPath:` 每次新建，所以 JS 侧记镜像。第二次用同一招，说明这不是特例而是模式——**凡是 `CGPathRef` / `CGColorRef` 这类非 ObjC 对象的属性，身份都得靠上层兜**。

### `AnimationClassName` 的顺序

加了三个类之后这个函数的顺序开始要紧了：`CASpringAnimation` 是 `CABasicAnimation` 的子类，必须排在前面。和 `LayerClassName` 同一条坑——包装表按指针缓存，第一次包成基类之后就一直是基类。

### 弹簧不看 duration

实测默认弹簧（mass 1、stiffness 100、damping 10）：

| | |
| --- | --- |
| `settlingDuration` | 1.473 s |
| `bounce` | 0.500 |
| `perceptualDuration` | 0.628 s |
| damping 10 → 40 之后 | `settlingDuration` 1.473 → 1.000 |

`duration` 对它不起作用，改物理参数才改得动什么时候停。三个只读属性都是系统按当前参数现算的。

`initWithPerceptualDuration:bounce:` **没做**：构造通道只传对象句柄，传不了标量。这是第二次撞上（第一次是 `CAMediaTimingFunction`），所以该给 `construct_native` 加一条 argsJSON——那是第三条通用的引擎通道，单独一步。

### 顺带咬出来的：验收用例里最后一个写死的延迟

A6-2 多出来的工作量把一条**早就存在的竞态**挤翻了面：`app/src/steps/textfield.js` 里那个 `setTimeout(900)` 之后的 `becomeFirstResponder()` 开始失败。

三种写法都试过，实测结果值得记下来——它们是「在忙碌的主线程上赌固定时长」的三种不同死法：

| 写法 | 结果 |
| --- | --- |
| `setTimeout(900)` | 落进 `stepModal` 的转场中间，UIKit **拒绝**交出 first responder（返回 `false`，正常行为不是 bug） |
| 同步调 | become 成功、`isEditing` 为真，但 **`editingDidBegin` 这个控件事件不发**。太早了 |
| 等模态散场 + 固定 400 ms | 前两条都躲开了，但主线程被别的段堵了 **2678 ms**，`endEditing` 之后那条没等到状态落定 |

最后改成**一个写死的延迟都没有**：三处全是「等一个能观察到的条件，6 秒没等到报未验证」。

根子不在验收用例：**运行时还没有「页面出现了」这个事件**（`viewDidAppear:` 是覆写点，要 M2），JS 表达不了那个时机，只能观察别的条件去逼近它。这条已经补进 `project.md` 的 C1。

## 实测

（这一节的数字由验收用例打出来，见 `app/src/steps/animation.js`。）

### 隐式动画要等图层渲染过一轮

`docs/api/ca-layer.md` 的「还没做」里一直挂着一条「隐式动画的行为**未验证**」。量出来是三段式的：

| 什么时候改属性 | `animationKeys()` |
| --- | --- |
| 图层还没有父图层 | `[]` |
| 加进树里了，但这一轮还没渲染过 | `[]` |
| **已经渲染过一轮之后** | **`['strokeEnd']`** |

所以隐式动画是真的，但**要等图层至少被提交渲染过一次**。验收用例全跑在 `sceneconnect` 里，那一刻什么都还没上屏，所以前两次量到的都是空。

连带解释了上面那条「动画晚 751 ms 才开始」：第一次提交本来就在那之后。

### `easeInEaseOut` 和 `default` 不是一回事

控制点实测：`easeInEaseOut` 是 (0.42, 0) (0.58, 1)，`default` 是 (0.25, 0.1) (0.25, 1)。

`controlPointAtIndex:` 在 ObjC 里是出参（`float[2]`），这里按已定规则改成返回一个 `CGPoint`——「出参可以改成返回值」。

---

API 怎么用见 [API 文档](../api/ca-animation.md)。

← 返回 [实现原理](README.md)
