# 颜色

**颜色属性读写都是字符串。**

```js
view.backgroundColor = '#5856D6';
view.backgroundColor;                    // '#5856D6' —— 你写的那个串，原样
view.backgroundColor = 'light-dark(#fff, #000)';   // 跟随深浅色
view.backgroundColor = 'systemBackground';         // 语义色
```

`UIColor` 这个类仍然在全局（**不能构造，只挂常量**），setter 也收它的对象——那是[底层](../project.md)的逃生口。

## 能写什么

| 形式 | 例子 |
| --- | --- |
| 十六进制 | `'#f00'` `'#ff0000'` `'#ff000080'` `'#f00a'` |
| `rgb` / `rgba` | `'rgb(255, 0, 0)'` `'rgb(255 0 0)'` `'rgba(255,0,0,.5)'` `'rgb(255 0 0 / 50%)'` |
| **跟随深浅色** | `'light-dark(#fff, #000)'`，两边可以是任意其它形式 |
| **颜色名** | `'systemBackground'` `'label'` `'systemBlue'`——能用的名字见[下面那张表](#能用的颜色名) |
| **Asset Catalog** | `'asset(BrandBlue)'`。想按**高对比度**配色就用它，Color Set 里可以配 Any/Light/Dark × Normal/High Contrast |
| 代号 | `'native(7)'`——读出来时给的，表示这个颜色写不成通用语法。赋回去有效 |
| `UIColor` 对象 | 底层的逃生口 |

## 写错不抛，打警告

```js
view.backgroundColor = '#GGG';
// [Nacre] backgroundColor: "#GGG" is not a valid color, ignored
// 颜色保持原来的值
```

这是**颜色特有的**，和[枚举](enums.md)不一样——枚举写错当场抛。颜色常常来自数据（主题文件、服务端配置），一个坏值不该炸掉半个界面。但也**不完全静默**：静默的话「写错了读回来还是旧值、一点提示都没有」，那个错很难查。

## 读回来是什么

**你写进去的那个串，原样还给你**，不规范化。`'#f00'` 不会变成 `'rgb(255, 0, 0)'`。

两条例外，都有原因：

| 情况 | 读回来 | 为什么 |
| --- | --- | --- |
| **同一个颜色值的不同拼法** | **最后写的那个拼法** | `UIView.backgroundColor` 这类属性对普通 RGB 读回来不是同一个对象（UIKit 自己规范化了一道），所以声明只能按**值**兜底。先写 `'#f00'` 再在别处写 `'rgb(255,0,0)'`，两处读回来都是后者。语义色和动态色不受影响 |
| **你没写过的颜色** | 按它的事实合成（名字 / `#rrggbb` / `native(n)`） | UIKit 的默认值、`tintColor` 继承来的——那本来就不是你写的 |

**往返是保证的**：getter 吐出来的任何串，赋回去都成立，包括 `native(n)`。

## 能用的颜色名

**固定色**，不随外观变：

`black` `darkGray` `lightGray` `white` `gray` `red` `green` `blue` `cyan` `yellow` `magenta` `orange` `purple` `brown` `clear`

**系统色**，深浅模式下会微调：

`systemRed` `systemGreen` `systemBlue` `systemOrange` `systemYellow` `systemPink` `systemPurple` `systemTeal` `systemIndigo` `systemBrown` `systemMint` `systemCyan` `systemGray`

**语义色**，按用途选，会跟着深浅模式和高对比度变：

`label` `secondaryLabel` `tertiaryLabel` `quaternaryLabel` `placeholderText` `separator` `opaqueSeparator` `link` `systemBackground` `secondarySystemBackground` `tertiarySystemBackground`

不在这张表里的名字当写错处理——警告 + 保留旧值，而且**警告里会把这张表列出来**。

## 为什么不是所有颜色都写得出来

`UIColor` 能表达的东西里有四类没有通用语法：图案色（`colorWithPatternImage:`）、**没有名字的动态色**、HDR（`exposure:` 一组）、`colorWithProminence:`。

但实际碰不到：JS 只能用字符串造颜色，而原生给 JS 的颜色**都有名字**（UIKit 的默认值就是语义色，Asset Catalog 的色按名字引用）。真漏网的会拿到 `native(n)`——**能往返、不撒谎**，只是对你不透明。

---

# `UIColor` 类

不能直接构造，只能从类级属性取——这和 ObjC 一致。

## 继承关系

```
EventTarget
└─ NSObject
   └─ UIColor
```

## 类级属性

同一个常量每次取到的是**同一个 JS 对象**（`UIColor.labelColor === UIColor.labelColor`）——原生对象的身份由包装机制保持。

### 基础色（`UIColor.h`）

`blackColor`、`darkGrayColor`、`lightGrayColor`、`whiteColor`、`grayColor`、`redColor`、`greenColor`、`blueColor`、`cyanColor`、`yellowColor`、`magentaColor`、`orangeColor`、`purpleColor`、`brownColor`、`clearColor`

固定的 RGB 值，不随外观变化。

### 系统色（`UIInterface.h`）

`systemRedColor`、`systemGreenColor`、`systemBlueColor`、`systemOrangeColor`、`systemYellowColor`、`systemPinkColor`、`systemPurpleColor`、`systemTealColor`、`systemIndigoColor`、`systemBrownColor`、`systemMintColor`、`systemCyanColor`、`systemGrayColor`

Apple 调校过的品牌色，深色模式下会换一组值。

### 语义色（`UIInterface.h`）

`labelColor`、`secondaryLabelColor`、`tertiaryLabelColor`、`quaternaryLabelColor`、`placeholderTextColor`、`separatorColor`、`opaqueSeparatorColor`、`linkColor`、`systemBackgroundColor`、`secondarySystemBackgroundColor`、`tertiarySystemBackgroundColor`

按**用途**而不是按颜色值命名。这类颜色是**动态**的：它在绘制时按当时的外观（深色／浅色）、对比度设置解析，所以取一次存着就能一直用，不需要在外观变化时重新取。

```js
view.backgroundColor = UIColor.systemBackgroundColor;  // 自动跟随深色模式
```

## 和原生的对照

| ObjC | JS |
| --- | --- |
| `UIColor.blackColor` | `UIColor.blackColor` |
| `UIColor.systemBlueColor` | `UIColor.systemBlueColor` |
| `UIColor.labelColor` | `UIColor.labelColor` |
| `view.backgroundColor = UIColor.systemBackgroundColor` | `view.backgroundColor = UIColor.systemBackgroundColor` |

名字和 ObjC 完全一样，**带 `Color` 后缀**（不是 Swift 的 `UIColor.black`）。照 Apple 文档查到什么就写什么。

## 还没做

- **带参数的类方法**：`colorWithRed:green:blue:alpha:`、`colorWithWhite:alpha:`、`colorWithHue:saturation:brightness:alpha:`。selector 的映射规则[已经定了](../project.md#待讨论的设计问题)（第一段 + options 对象），这几个没做是优先级问题——日常写颜色走字符串简写，它们只作为「完整暴露」的承诺留着
- **读回颜色分量**：`getRed:green:blue:alpha:` 这类取值方法需要 `CGFloat *` 出参，要先有结构体和出参的支持
- **变化通知**：按[原则 10](../project.md#原则)这一格要补，但它属于 trait 体系而不是颜色，见上面「明暗主题挂在哪」。等暴露 `UIView` 的 trait 相关能力时一起做

---

实现原理和实测数据见[实现说明](../internals/ui-color.md)。

← 返回 [API 文档](README.md)
