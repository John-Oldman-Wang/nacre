---
type: reference
native: "+[UIFont preferredFontForTextStyle:]"
---

# `UIFont.preferredFontForTextStyle()` 静态方法

**`UIFont.preferredFontForTextStyle()`** 静态方法按用途（正文、标题、脚注等）返回一个系统字体。字号取决于用户在系统的「设置 → 显示与亮度 → 文字大小」里选的档位。

## 语法

```
UIFont.preferredFontForTextStyle(style)
```

### 参数

**`style`**

[文本样式](../ui-font.md#文本样式)名，下面十一个之一：`'largeTitle'`、`'title1'`、`'title2'`、`'title3'`、`'headline'`、`'subheadline'`、`'body'`、`'callout'`、`'footnote'`、`'caption1'`、`'caption2'`。

### 返回值

`UIFont`，不会是 `null`。字号是调用这一刻的文字大小设置下的字号。

返回的字体对象不可变。用户之后改了设置，这个对象的 `pointSize` 不变，已经用了它的标签也不变。要跟着变，在 `application` 的 `contentsizecategorychange` 事件里重新调用并赋值，见[动态字体](../ui-font.md#动态字体)。

### 异常

**`TypeError`**

`style` 不是十一个名字之一：

```
TypeError: textStyle has no value "subtitle"; expected one of: largeTitle / title1 / title2 / title3 / headline / subheadline / body / callout / footnote / caption1 / caption2
```

## 示例

### 用正文样式

```js
const label = new UILabel();
label.font = UIFont.preferredFontForTextStyle('body');
console.log(label.font.pointSize);
```

**效果**

- 文字用「正文」样式显示。
- 控制台输出当前设置下正文的字号。用户把文字调大后重新启动 App，输出的数变大。**「调大后变大」未在模拟器验证。**

### 用户改了设置后更新字体

```js
const label = new UILabel();
label.font = UIFont.preferredFontForTextStyle('body');
application.addEventListener('contentsizecategorychange', () => {
  label.font = UIFont.preferredFontForTextStyle('body');
});
```

**效果**：App 在运行时，用户到系统设置里改了文字大小，回到 App 后文字换成新的字号。**未在模拟器验证。**

## 对应的 iOS API

`+[UIFont preferredFontForTextStyle:]`。`UIFontTextStyleBody` 写成 `'body'`，其余同理。

## 参见

- [动态字体](../ui-font.md#动态字体)
- [设置字体](../../guides/fonts.md)
- [`application`](../application.md)：`contentSizeCategory` 和 `contentsizecategorychange` 事件
