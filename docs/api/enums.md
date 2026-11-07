# 枚举

ObjC 的枚举在 JS 里**一律是字符串**。

```js
label.textAlignment = 'center';
label.lineBreakMode = 'byTruncatingTail';
view.contentMode    = 'scaleAspectFit';
```

名字是 ObjC 常量去掉类型前缀、首字母小写：

| ObjC | JS |
| --- | --- |
| `NSTextAlignmentCenter` | `'center'` |
| `NSLineBreakByTruncatingTail` | `'byTruncatingTail'` |
| `UIViewContentModeScaleAspectFit` | `'scaleAspectFit'` |

读出来也是字符串，和写进去的一致。

## 认不出的值直接抛

属性位和参数位都抛 `TypeError`，错误信息把可选值列出来：

```js
label.textAlignment = 'centre';
// TypeError: textAlignment 没有 "centre" 这个值，
//            可选：left / center / right / justified / natural

UIFont.systemFontOfSize(17, { weight: 'extrabold' });
// TypeError: weight 没有 "extrabold" 这个值，
//            可选：ultraLight / thin / light / regular / medium /
//                  semibold / bold / heavy / black
```

不会静默忽略，也不会退回默认值。

### 「没有这个东西」不是错误

要和上面分开的是**合法的空答案**：

```js
UIFont.fontWithName('NoSuchFont', { size: 17 });   // → null，不抛
```

系统里没有这个字体，是一个真实的回答；`'extrabold'` 不是字重，是调用方写错了。所以调用通道不能靠「返回空值」表示失败——它另有一条[带外的错误出口](#实现带外的错误出口)。

### 为什么不学 CSS

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

三条调用通道（`call_method`、`call_object_method`、`call_class_object_method`）都多带一个 `std::string* error` 出参。宿主往里写一句话，就表示这次调用的参数不被接受，引擎据此抛 `TypeError`，返回值丢掉。

属性写入走的是另一条路：`write_property` 返回 `bool`，JS 侧据此抛。

> 两条路的错误信息现在来自两个地方——参数位由原生层凑（可选值直接取自查表用的那张表），属性位由 `nacre.js` 里的 `ENUM_VALUES` 凑。**这份 JS 副本是个隐患**：它和原生层的表是两份数据，会漂。统一的做法是把 `write_property` 也改成带外错误、删掉 `ENUM_VALUES`，还没做。

## 位掩码

`UIControlEvents`、`UIViewAutoresizing` 这类能按位或组合的，用**字符串数组**：

```js
view.autoresizingMask = ['flexibleWidth', 'flexibleHeight'];
```

> 还没实现。等做到用得上它的地方再加，规则先定在这里。

## 不是枚举但一样用字符串的

有些 ObjC 里是常量而不是枚举，JS 侧一视同仁用字符串：

| 类型 | ObjC 实际是 | 例子 |
| --- | --- | --- |
| `UIFontWeight` | `CGFloat` 常量 | `'regular'`、`'bold'`、`'heavy'` |
| `UIFontTextStyle` | `NSString` 常量 | `'body'`、`'largeTitle'`、`'caption1'` |

对 JS 开发者来说它们和枚举没区别，没必要暴露这个实现细节。但要记住它们属于「C 常量怎么暴露」那个更大的问题，现在是手写映射，等 bindgen 一起收。

---

← 返回 [API 文档](README.md)
