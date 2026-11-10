# `UIColor`

颜色。不能直接构造，只能从类级属性取——这和 ObjC 一致。

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
