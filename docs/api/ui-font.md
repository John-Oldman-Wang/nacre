# `UIFont`

字体。不能直接构造，走类方法。

```js
label.font = UIFont.systemFontOfSize(28, { weight: 'bold' });
label.font = UIFont.preferredFontForTextStyle('body');   // 跟随系统文字大小
```

## 继承关系

```
EventTarget → NSObject → UIFont
```

## 系统字体

```js
UIFont.systemFontOfSize(17)                                  // .SFUI-Regular
UIFont.systemFontOfSize(28, { weight: 'bold' })              // .SFUI-Bold
UIFont.boldSystemFontOfSize(17)
UIFont.italicSystemFontOfSize(17)
UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' })  // 等宽
UIFont.monospacedDigitSystemFontOfSize(17, { weight: 'regular' })  // 只有数字等宽
UIFont.fontWithName('Helvetica', { size: 17 })
```

`weight` 可选：`ultraLight` `thin` `light` `regular` `medium` `semibold` `bold` `heavy` `black`。

`monospacedDigitSystemFontOfSize` 只把**数字**做成等宽，字母照常——跑秒表、倒计时、价格这类数字会跳动的地方用它，字宽不变就不会左右抖。

## 动态字体

```js
UIFont.preferredFontForTextStyle('body')
```

跟随系统「设置 → 显示与亮度 → 文字大小」。可选：`largeTitle` `title1` `title2` `title3` `headline` `subheadline` `body` `callout` `footnote` `caption1` `caption2`。

> **已经建好的 `UIFont` 不会跟着变。** 用户改了系统文字大小，手上这个字体对象还是旧字号。
>
> 让标签自动跟随要靠 `UILabel.adjustsFontForContentSizeCategory`，那个属性还没暴露，记在 [`UILabel` 的「还没做」](ui-label.md#还没做)里。

## 只读属性

| 属性 | 效果 |
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

> 别指望所有字体都这样——`fontWithName:size:` 之类未必命中系统缓存。

## 写错了会抛，找不到返回 null

这两件事要分开：

```js
UIFont.systemFontOfSize(17, { weight: 'extrabold' });
// TypeError: weight has no value "extrabold"; expected one of: ultraLight / …

UIFont.preferredFontForTextStyle('subtitle');
// TypeError: textStyle has no value "subtitle"; expected one of: largeTitle / …

UIFont.fontWithName('NoSuchFont', { size: 17 });   // → null，不抛
```

「你问错了」抛，「没有这个东西」返回 `null`。不传 `weight` 也是合法的（`systemFontOfSize:` 本身就是 regular）——**传错和不传是两件事**。

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `[UIFont systemFontOfSize:17]` | `UIFont.systemFontOfSize(17)` |
| `[UIFont systemFontOfSize:28 weight:UIFontWeightBold]` | `UIFont.systemFontOfSize(28, { weight: 'bold' })` |
| `[UIFont monospacedSystemFontOfSize:20 weight:UIFontWeightMedium]` | `UIFont.monospacedSystemFontOfSize(20, { weight: 'medium' })` |
| `[UIFont fontWithName:@"Helvetica" size:17]` | `UIFont.fontWithName('Helvetica', { size: 17 })` |
| `[UIFont preferredFontForTextStyle:UIFontTextStyleBody]` | `UIFont.preferredFontForTextStyle('body')` |

selector 的第一段做方法名，其余段进 options 对象，键名就是 ObjC 的段名原文。

## 还没做

| | |
| --- | --- |
| `UIFontDescriptor` | 字体变体和特性 |
| `familyNames` / `fontNamesForFamilyName:` | 枚举系统里所有字体 |
| 自定义字体注册 | |

---

← 返回 [API 文档](README.md)
