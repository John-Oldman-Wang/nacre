# 显示带样式的文字

这一篇讲怎么用[富文本](../api/ns-attributed-string.md)在一段文字里混用几种字体和颜色，加下划线、删除线、阴影，调行距和对齐，插入图片，量出尺寸，以及富文本在标签、输入框、按钮上怎么读写。每个类的细节在 [`NSAttributedString`](../api/ns-attributed-string.md)、[`NSMutableAttributedString`](../api/ns-mutable-attributed-string.md)、[`NSParagraphStyle`](../api/ns-paragraph-style.md)、[`NSShadow`](../api/ns-shadow.md)、[`NSTextAttachment`](../api/ns-text-attachment.md) 的参考页。

## 推荐的做法

- **整段一种样式就用 `text`，一段里要混用几种样式才用富文本。** 标签的 `text` 和 `font`、`textColor` 写起来更简单。
- **先把样式对象设好，再建富文本，最后交给视图。** 视图拿走的是赋值那一刻的内容；段落样式和阴影放进富文本的也是当时的一份副本。之后再改它们，界面不会跟着变。要改就重新建一个再赋值。
- **标签显示过富文本之后，要改内容就继续写 `attributedText`。** 再写 `text` 时原来的样式会留着。
- **比较两个富文本的内容用 [`isEqualToAttributedString()`](../api/ns-attributed-string/isequaltoattributedstring.md)**，不要用 `===`：从视图上读回来的是一份快照，每次读可能是不同的对象。

## 第一个例子

从空白 App 开始，在屏幕上显示一行价格：前面是普通的小字，价格是红色大字，原价是灰色带删除线。

```js
application.addEventListener('sceneconnect', (e) => {
  // 建窗口和页面。每个 App 都要有这几行
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 一段一段建，每一段有自己的属性
  const text = new NSMutableAttributedString('到手价 ', {
    font: UIFont.systemFontOfSize(15),
    foregroundColor: 'label',
  });
  text.appendAttributedString(new NSAttributedString('¥128', {
    font: UIFont.boldSystemFontOfSize(26),
    foregroundColor: 'systemRed',
  }));
  text.appendAttributedString(new NSAttributedString('  ¥199', {
    font: UIFont.systemFontOfSize(13),
    foregroundColor: 'secondaryLabel',
    strikethroughStyle: ['single'],
  }));

  // 2. 交给标签显示
  const label = new UILabel();
  label.attributedText = text;

  // 3. 放到页面上，位置定在正中
  label.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(label);
  NSLayoutConstraint.activateConstraints([
    label.centerXAnchor.constraintEqualToAnchor(page.view.centerXAnchor),
    label.centerYAnchor.constraintEqualToAnchor(page.view.centerYAnchor),
  ]);
});
```

**效果**（未在模拟器验证）

- 屏幕正中出现一行字：「到手价」是 15 pt 的普通字，「¥128」是 26 pt 的红色粗体，「¥199」是 13 pt 的灰色字，中间划着一条线。
- 三段的底边对齐在同一条基线上。

下面的例子都沿用这里的 `label`：一个加到页面上的标签。单独试某一节时，先写这几行：

```js
const page = new UIViewController();
const label = new UILabel();
page.view.addSubview(label);
```

## 整段文字用同一组属性

```js
label.attributedText = new NSAttributedString('重要通知', {
  font: UIFont.boldSystemFontOfSize(17),
  foregroundColor: '#ff3b30',
  kern: 2,
});
```

**效果**（未在模拟器验证）：四个字是红色粗体，字与字之间比平常多空 2 pt。

## 只给其中一段加样式

先用整段文字建一个可改的富文本，再用 [`addAttribute()`](../api/ns-mutable-attributed-string/addattribute.md) 给一段加属性。范围的写法见[范围怎么写](../api/ns-attributed-string.md#范围怎么写)。

```js
const source = '合计 ¥128.00';
const priceText = new NSMutableAttributedString(source, { font: UIFont.systemFontOfSize(17) });
const start = source.indexOf('¥');
priceText.addAttribute('foregroundColor', {
  value: 'systemRed',
  range: new NSRange(start, source.length - start),
});
label.attributedText = priceText;
```

**效果**（未在模拟器验证）：「合计」是默认的颜色，「¥128.00」是红色。

`addAttribute()` 只动这一个属性，这一段原来的字体不变。

## 下划线和删除线

`underlineStyle` 和 `strikethroughStyle` 的值是数组，里面写线型，可以再加一种虚线，见[线型](../api/ns-attributed-string.md#线型)。

```js
const lineText = new NSMutableAttributedString('实线 双线 虚线', {
  font: UIFont.systemFontOfSize(17),
});
lineText.addAttribute('underlineStyle', { value: ['single'], range: new NSRange(0, 2) });
lineText.addAttribute('underlineStyle', { value: ['double'], range: new NSRange(3, 2) });
lineText.addAttributes(
  { underlineStyle: ['single', 'patternDash'], underlineColor: 'systemRed' },
  { range: new NSRange(6, 2) },
);
label.attributedText = lineText;
```

**效果**：「实线」下面一条线，「虚线」下面一条红色的虚线。「双线」是上下两条线，靠上的一条贴着字的底边，靠下的一条能不能看见取决于标签的高度，见下面第一条。

> **注意**：标签的高度正好等于文字的高度时，双线靠下的那一条看不见。17 pt 的字，标签自己算出来的高度是 20.33 pt，而双线的第二条画在这个范围的外面，标签不画范围外面的东西。给标签一个更高的高度就能看到两条线，比如加一条高度约束：`label.heightAnchor.constraintEqualToConstant(28)`。粗线（`'thick'`）的底边也会被切掉一点。

> **注意**：虚线的一划的长度跟着字号走。17 pt 的字，`'patternDash'` 的一划大约一个汉字宽，两个字下面只有两划、中间一个小缺口，一眼看去像实线。要短一些的间隔用 `'patternDot'`。

不写 `underlineColor` 时，线的颜色和文字相同。

## 调行距和对齐

行距、对齐、缩进属于段落样式。建一个 [`NSMutableParagraphStyle`](../api/ns-mutable-paragraph-style.md)，设好之后作为 `paragraphStyle` 属性放进去。

```js
const style = new NSMutableParagraphStyle();
style.alignment = 'center';
style.lineSpacing = 8;

label.numberOfLines = 0;
label.attributedText = new NSAttributedString('第一行\n第二行', {
  font: UIFont.systemFontOfSize(17),
  paragraphStyle: style,
});
```

**效果**（未在模拟器验证）：两行文字居中，两行之间比平常多空 8 pt。

段落样式对它覆盖到的整个段落生效。一个段落是两个换行符之间的文字。

## 文字里插一张图片

图片要先包成[附件](../api/ns-text-attachment.md)，再用附件建一个只有一个字符的富文本，拼到文字中间。

```js
const star = UIImage.systemImageNamed('star.fill');
if (star !== null) {
  const attachment = NSTextAttachment.textAttachmentWithImage(star);
  attachment.bounds = new CGRect(0, -3, 18, 18);

  const starText = new NSMutableAttributedString('评分 ', { font: UIFont.systemFontOfSize(17) });
  starText.appendAttributedString(NSAttributedString.attributedStringWithAttachment(attachment));
  starText.appendAttributedString(new NSAttributedString(' 4.8'));
  label.attributedText = starText;
}
```

**效果**（未在模拟器验证）：「评分」和「4.8」之间有一颗 18 × 18 pt 的星，比文字的基线低 3 pt。

`bounds` 的原点在文字的基线上，`y` 为负是往下移。不设 `bounds` 时图片按自己的大小显示，底边贴着基线。

## 改占位文字的颜色

```js
const field = new UITextField();
field.attributedPlaceholder = new NSAttributedString('请输入手机号', {
  foregroundColor: 'systemOrange',
});
```

**效果**（未在模拟器验证）：输入框为空时显示橙色的「请输入手机号」。

## 按钮上用富文本做标题

```js
const button = UIButton.buttonWithType('system');
button.setAttributedTitle(new NSAttributedString('空心字', {
  font: UIFont.boldSystemFontOfSize(22),
  strokeWidth: 3,
  strokeColor: 'systemIndigo',
}), { forState: ['normal'] });
```

**效果**（未在模拟器验证）：按钮上的字只有靛蓝色的轮廓，中间不填色。

某个状态设了富文本标题之后，这个状态下不再显示 `setTitle()` 给的文字，`setTitleColor()` 的颜色也不起作用。

## 量一段富文本要占多大

排成一行用 [`size()`](../api/ns-attributed-string/size.md)。限定宽度、让它折行，用 [`boundingRectWithSize()`](../api/ns-attributed-string/boundingrectwithsize.md)，并且 `options` 要带 `'usesLineFragmentOrigin'`。

```js
const measured = new NSAttributedString('一段比较长的文字，一行放不下的时候会折行。', {
  font: UIFont.systemFontOfSize(17),
});
const oneLine = measured.size();
const wrapped = measured.boundingRectWithSize(
  new CGSize(200, Number.MAX_VALUE),
  { options: ['usesLineFragmentOrigin'] },
);
console.log(oneLine.width, Math.ceil(wrapped.height));
```

**效果**（未在模拟器验证）：控制台输出两个数。第一个是排成一行的宽度，第二个是限宽 200 pt 时需要的高度，都以 pt 为单位。

不限高度时把高度写成 `Number.MAX_VALUE`。量出来的数带小数，用作视图的大小时向上取整。

## 富文本在四种视图上的读写

| 成员 | 类型 | 可读 | 可写 | 说明 |
| --- | --- | --- | --- | --- |
| [`UILabel.attributedText`](../api/ui-label/attributedtext.md) | `NSAttributedString` 或 `null` | 是 | 是 | 带样式的文字。没有内容时是 `null` |
| `UITextField.attributedText` | `NSAttributedString` 或 `null` | 是 | 是 | 带样式的内容 |
| `UITextField.attributedPlaceholder` | `NSAttributedString` 或 `null` | 是 | 是 | 带样式的占位文字 |
| `UITextView.attributedText` | `NSAttributedString` 或 `null` | 是 | 是 | 带样式的内容。写 `null` 是清空 |
| [`UIButton.currentAttributedTitle`](../api/ui-button/currentattributedtitle.md) | `NSAttributedString` 或 `null` | 是 | 否 | 当前状态下实际显示的带样式标题 |

`attributedText` 和 `text` 是同一份内容的两种读写方式。写了 `attributedText`，`text` 读出来是其中的纯文字。反过来，写过 `attributedText` 之后再写 `text`，三种视图不一样：

| 视图 | 再写 `text` 之后 |
| --- | --- |
| `UILabel` | 文字换成新的，**原来富文本里的样式留着**。比如原来带下划线，新文字也带下划线 |
| `UITextView` | 文字换成新的，原来的样式被去掉 |
| `UITextField` | 文字换成新的。原来的样式留不留着**未在模拟器验证** |

所以标签显示过富文本之后，要改内容就继续写 `attributedText`：赋一个新的富文本，内容和样式一起换掉。先写 `attributedText = null` 再写 `text` 能不能去掉样式，**未在模拟器验证**。

```js
label.attributedText = new NSAttributedString('促销', { underlineStyle: ['single'] });
label.text = '已结束';
const now = label.attributedText;
console.log(now === null ? 'null' : (now.attributesAtIndex(0).underlineStyle || []).join(','));
```

**效果**：控制台输出 `single`。标签上的字换成了「已结束」，下划线还在。

`attributedPlaceholder` 和 `placeholder` 也是同一份内容：写了其中一个，另一个读出来的文字跟着变。

代码写 `attributedText` 不派发 `input` 事件，和代码写 `text` 一样。

按钮按状态设置，写法和 [`setTitle()`](../api/ui-button/settitle.md) 相同：

| 方法 | 说明 |
| --- | --- |
| [`setAttributedTitle()`](../api/ui-button/setattributedtitle.md) | 给这些状态设带样式的标题。`title` 给 `null` 是去掉，这个状态回到使用 `normal` 的 |
| [`attributedTitleForState()`](../api/ui-button/attributedtitleforstate.md) | 读这个状态用的带样式标题。参数是一个状态名 |

`attributedTitleForState()` 对没有单独设过的状态返回 `normal` 的那个，和 [`titleForState()`](../api/ui-button/titleforstate.md) 一样。`normal` 也没设过时返回 `null`。

```js
const submit = UIButton.buttonWithType('system');
submit.setAttributedTitle(new NSAttributedString('提交'), { forState: ['normal'] });

submit.attributedTitleForState('normal');     // 内容是「提交」的富文本
submit.attributedTitleForState('disabled');   // 也是「提交」：没单独设过，返回 normal 的
```

读回来的是一份快照，和写进去的不一定是同一个对象，比较内容用 `isEqualToAttributedString()`。

- **出错**：
  - 写入的值不是富文本：`TypeError: attributedText needs a native object or null, got "纯文字"`
  - 写入的是别的原生对象：`TypeError: attributedText needs a NSAttributedString or null`
  - 没传 `forState`：`TypeError: setAttributedTitle needs { forState }`

## 参见

- [`NSAttributedString`](../api/ns-attributed-string.md)：属性的全部名字、范围的写法
- [`NSMutableAttributedString`](../api/ns-mutable-attributed-string.md)：改属性、改文字
- [`NSMutableParagraphStyle`](../api/ns-mutable-paragraph-style.md)：段落样式
- [`NSShadow`](../api/ns-shadow.md)、[`NSTextAttachment`](../api/ns-text-attachment.md)
- [显示文字](labels.md)：标签的其余用法
