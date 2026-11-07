# `UIFont`

字体。不能直接构造，走类方法。

## 继承关系

```
EventTarget
└─ NSObject
   └─ UIFont
```

## 系统字体

```js
UIFont.systemFontOfSize(17)                        // .SFUI-Regular
UIFont.systemFontOfSize(28, { weight: 'bold' })    // .SFUI-Bold
UIFont.boldSystemFontOfSize(17)
UIFont.italicSystemFontOfSize(17)
UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' })
UIFont.monospacedDigitSystemFontOfSize(17, { weight: 'regular' })
UIFont.fontWithName('Helvetica', { size: 17 })
```

`weight` 的可选值：`ultraLight` `thin` `light` `regular` `medium` `semibold` `bold` `heavy` `black`。

> ObjC 里 `UIFontWeight` 是 `CGFloat` 常量不是枚举，但 JS 侧一样用字符串，见[枚举文档](enums.md)。

## 动态字体

```js
UIFont.preferredFontForTextStyle('body')
```

跟随系统「设置 → 显示与亮度 → 文字大小」变化。可选值：`largeTitle` `title1` `title2` `title3` `headline` `subheadline` `body` `callout` `footnote` `caption1` `caption2`。

这是 iOS 上做无障碍的基本手段，比写死字号更该是默认选择。

> **已经建好的 `UIFont` 不会跟着变。** 用户改了系统文字大小，手上这个字体对象还是旧字号。
>
> 但这一格**不该用事件补**——UIKit 给的是一个属性：`UILabel.adjustsFontForContentSizeCategory = true`，设了之后标签自己会重新取字体。这个属性还没暴露，记在 [`UILabel` 的「还没做」](ui-label.md#还没做)里。
>
> 真正需要事件的是 JS 自己要对文字大小变化做判断的场合（比如换布局），那属于 trait 体系，见[项目说明的 TODO](../project.md#待讨论的设计问题)。

## 只读属性

| 属性 | 说明 |
| --- | --- |
| `familyName` | 字体家族名 |
| `fontName` | 具体字体名，比如 `.SFUI-Bold` |
| `pointSize` | 字号 |
| `ascender` / `descender` | 基线以上 / 以下的高度 |
| `capHeight` / `xHeight` | 大写字母高度 / 小写 x 高度 |
| `lineHeight` | 行高 |
| `leading` | 行间距 |

## 同一个字体是同一个对象

```js
UIFont.systemFontOfSize(17) === UIFont.systemFontOfSize(17)   // true
```

UIKit 自己缓存了系统字体实例，加上运行时的包装机制保证指针到 JS 对象一对一，所以 `===` 直接成立。这是[相等性 TODO](../project.md#待讨论的设计问题) 里「主路径已经通」的又一个例子。

> 但别指望所有字体都这样。`fontWithName:size:` 之类未必命中缓存。

## 字重和样式写错了会抛

```js
UIFont.systemFontOfSize(17, { weight: 'extrabold' });
// TypeError: weight 没有 "extrabold" 这个值，可选：ultraLight / thin /
//            light / regular / medium / semibold / bold / heavy / black

UIFont.preferredFontForTextStyle('subtitle');
// TypeError: textStyle 没有 "subtitle" 这个值，可选：largeTitle / title1 / ...
```

不传 `weight` 则用默认值（`systemFontOfSize:` 本身就是 regular），**传错和不传是两件事**。

和它区分开的是合法的空答案：

```js
UIFont.fontWithName('NoSuchFont', { size: 17 });   // → null，不抛
```

详见[枚举文档](enums.md#认不出的值直接抛)。

## 还没做

`UIFontDescriptor`（字体描述符，用来做字体变体和特性）、`familyNames` / `fontNamesForFamilyName:`（枚举系统里所有字体）、自定义字体注册。

---

← 返回 [API 文档](README.md)
