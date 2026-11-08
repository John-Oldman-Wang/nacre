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
// TypeError: textAlignment has no value "centre";
//            expected one of: left / center / right / justified / natural

UIFont.systemFontOfSize(17, { weight: 'extrabold' });
// TypeError: weight has no value "extrabold";
//            expected one of: ultraLight / thin / light / regular /
//                             medium / semibold / bold / heavy / black
```

不会静默忽略，也不会退回默认值。

### 「没有这个东西」不是错误

要和上面分开的是**合法的空答案**：

```js
UIFont.fontWithName('NoSuchFont', { size: 17 });   // → null，不抛
```

系统里没有这个字体，是一个真实的回答；`'extrabold'` 不是字重，是调用方写错了。所以调用通道不能靠「返回空值」表示失败——它另有一条[带外的错误出口](../internals/enums.md#实现带外的错误出口)。

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

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `NSTextAlignmentCenter` | `'center'` |
| `UIViewContentModeScaleAspectFit` | `'scaleAspectFit'` |
| `UIImageRenderingModeAlwaysTemplate` | `'alwaysTemplate'` |
| `NSLayoutRelationGreaterThanOrEqual` | `'greaterThanOrEqual'` |
| `UIFontWeightSemibold` | `'semibold'` |
| `UIFontTextStyleLargeTitle` | `'largeTitle'` |
| `kCACornerCurveContinuous` | `'continuous'` |
| `kCALayerMinXMinYCorner \| kCALayerMaxXMinYCorner` | `['minXMinY', 'maxXMinY']` |

规则：**去掉类型前缀，首字母小写**。位掩码用字符串数组。

---

实现原理见[实现说明](../internals/enums.md)。

← 返回 [API 文档](README.md)
