# 枚举和位掩码

为什么不学 CSS、为什么映射表只能在原生层、错误怎么带出来。

## 为什么不学 CSS

Web 里 `el.style.fontWeight = 'extrabold'` 既不抛也不退回默认值，而是**保持原值**（实测：先设 `bold` 再写无效值，读回还是 `bold`，严格模式下也不抛）。CSS 这么宽容有三个理由：要向前兼容（老浏览器遇到新值必须忽略，否则 CSS 没法演进）、要跑不受信任的代码、有层叠兜底（一条声明废了其他照常生效）。

这三条我们一条都不占，见[原则 8](../project.md#原则)。

而且 Web 自己也是分两套的——**声明式的样式表容错，API 调用的参数不容错**：

```js
el.attachShadow({ mode: 'nope' })                  // TypeError
new Request(url, { mode: 'nope' })                 // TypeError
el.animate([], { duration: 1, fill: 'nope' })      // TypeError
new Intl.NumberFormat('en', { style: 'nope' })     // RangeError
```

`{ weight: 'bold' }` 在形状上就是 Web IDL 的字典成员，所以按 Web 自己划的线，它落在抛的那一边。

## 属性位不抛（2026-11-17）

上一节的结论是「一律抛」。2026-11-17 改了属性位：**枚举属性写了不认识的值，不抛，打一条警告，值保持不变。** 方法参数、options、构造参数里的枚举照旧抛。

### 为什么改

上一节自己就写着 Web 是分两套的，而我们原来把两套都按抛的那一边处理了。属性位在 Web 上其实有两种不抛的做法：

| | 写错之后 |
| --- | --- |
| `input.type = 'foo'` | 退回默认值 `text`。写进去的原样留在 HTML 属性里 |
| `ctx.textAlign = 'foo'`、`xhr.responseType = 'foo'` | 忽略这次赋值，保持原值 |

`input.type` 那样设计是为了向前兼容：后来加的 `date`、`color` 在不认识它们的旧浏览器里变成普通文本框，页面照样能用。我们手里有一个完全对应的例子：`textContentType` 有三个 iOS 27 才有的取值，在 iOS 26 上写它们原来是抛 `TypeError`，一行给新系统准备的代码会让旧系统上的整段逻辑中断。

用户的原话是「js 的容错性不就丢了吗」。上一节「我们的 JS 是开发者自己打包的、不需要宽容」那条理由，对着这个例子不成立：同一份 JS 要跑在不同版本的系统上。

### 为什么是保持原值，不是退回默认值

- **新建的对象上两种结果相同。** 第一次就写错，保持原值就是 UIKit 自己的默认值。差别只出现在「已经设了非默认值再写错」，而这时从 `center` 跳回 `natural` 比留在 `center` 更让人意外。
- **「默认值」跟着类走，不跟着枚举走。** 同一个 `contentMode`，普通视图和标签的默认值不一样。要退回默认值，得给七十多个属性逐个量一遍、维护一张表。
- `input.type` 能退回默认值，是因为 DOM 另有地方存写错的原始值。原生属性没有。

### 为什么参数位还是抛

属性写错，对象还是一个能用的对象，只是这一项没变。参数写错，这次调用本身不成立：`UIFont.systemFontOfSize(17, { weight: 'bolt' })` 没有一个合理的字体可以返回。Web 在这些位置也是抛。

### 怎么实现的

属性写入这条通道多了第三种结果。原来宿主往 `error` 里写一句话，引擎就抛；现在多一个 `warning` 出参：宿主填了它，引擎不抛，把这句话作为 `setProp` 的返回值交给 JS，内置脚本的 `nativeSet` 用 `console.warn` 打出来，前面加 `[Nacre] `，后面加 `, ignored`，和颜色写错时的警告一个样子。

哪些报错算「枚举不认识的值」，**不靠认报错的文字**。凑那句话的函数 `EnumError` 在凑的同时置一个标记；写属性的入口 `WriteNativeProperty` 在分发之前清掉它，分发之后如果有报错而且标记置上了，就把这句话从 `error` 挪到 `warning`。JS 和原生都在主线程上，一个静态变量就够。事件名放宽时是在入口匹配报错文案的前缀，外部审查指出过那样改措辞会改行为，这次没有再那么做。

因为是在入口统一处理的，一百五十多处调用 `EnumError` 的地方一处都没动，能力包也不用改：它们的属性写入走的是同一个入口。方法调用、构造、类方法走的是别的通道，不经过这个入口，所以照旧抛。

「值保持不变」靠的是各个处理函数本来的写法：先把名字查成数值，查不到就填报错返回，这时还没碰过原生对象。这一条没有机械保证，靠下面那张表验。

### 量到的范围

类型定义里可写的枚举属性一共 71 个（其中 10 个的值是字符串数组）。验收里有一张按表驱动的用例，每个属性先换到一个非初始值、再写一个不认识的值，断言没有抛、读回来还是写错之前的值、正好一条警告。iPhone Air 模拟器（iOS 27.2）上 69 个通过；相机的 `cameraDevice`、`cameraFlashMode` 在模拟器上读不了，自己报了未验证。

没改实现时这张表里 74 条失败（71 个属性加几条别的写法），全部是抛了 `TypeError`。

另有一些属性的类型是「数，或者几个名字」（`UIStackView.spacing`、约束的 `priority`、滚动视图的 `decelerationRate`、定位的 `desiredAccuracy`），名字写错同样走 `EnumError`，所以也跟着变成了警告加值不变。数写错（转不成有限数）是参数转换的事，照旧抛。

值是数组的属性给的不是数组，报的是另一句话，不经过 `EnumError`，照旧抛：那是类型不对，不是取值不认识。

## 为什么映射表在原生层

因为**枚举的数值不是固定的**。`NSText.h` 里：

```objc
typedef NS_ENUM(NSInteger, NSTextAlignment) {
    NSTextAlignmentLeft      = 0,
#if TARGET_ABI_USES_IOS_VALUES
    NSTextAlignmentCenter    = 1,
    NSTextAlignmentRight     = 2,
#else
    NSTextAlignmentRight     = 1,
    NSTextAlignmentCenter    = 2,
#endif
    ...
```

**iOS 上 Center 是 1，macOS 上是 2。** 在 JS 里按数组下标映射名字，换个平台就全错。

所以名字 ↔ 数值的表写在 `NacreRuntime.mm` 里，用真正的 SDK 常量。JS 侧只持有一份名字列表，**仅用于凑错误信息**，不参与映射——就算这份列表和原生层对不上，结果也只是错误信息不准，不会写进错误的值：原生层查不到名字就返回 `false`，JS 照样抛。

## 实现：带外的错误出口

属性写入和三条调用通道（`call_method`、`call_object_method`、`call_class_object_method`）都多带一个 `std::string* error` 出参。宿主往里写一句话，就表示这次写入或调用不被接受，引擎据此抛 `TypeError`，返回值丢掉。

**错误信息全部由原生层凑**，JS 侧一份副本都不留。两个原因：

1. 可选值列表就在原生层那张表里，抄一份到 JS 就是两份数据，会漂
2. 原生层知道上下文——是哪个类的哪个属性。按属性名索引的表迟早会撞：`UIControl.state` 是 `UIControlState`，`UIGestureRecognizer.state` 是 `UIGestureRecognizerState`，两个毫无关系的枚举；`UITableView.style`、`UIBlurEffect.style`、`UIActivityIndicatorView.style` 是三个不相干的枚举

> 那枚举的可选值要不要**暴露给 JS**（比如做成类的静态属性）？暂时不做。ObjC 运行时本身没有枚举反射——`NS_ENUM` 编译完就是整数常量，问不出「`NSTextAlignment` 有哪些值」。我们手里这张表是从头文件抄的，所以暴露它不是补齐 iOS 的能力，而是发明一个新 API，那属于上层。等 bindgen 把枚举类型名作为符号暴露出来时，可选值自然挂在它身上，和 TypeScript 定义一起做。

---

← 返回[实现原理](README.md) ・ [API 文档](../api/enums.md)
