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
