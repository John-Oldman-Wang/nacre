# 让读屏念对你的界面

这一篇讲怎么用 [`UIView`](../api/ui-view.md) 上的无障碍属性，让读屏把界面念对：什么时候把一个视图设成读屏元素、名字和提示和值各放什么、特征怎么选、自己做的控件怎么把几个子视图合成一个元素、弹层怎么让读屏只在里面转。

读屏（VoiceOver，系统设置里叫「旁白」）是 iOS 自带的屏幕阅读器，给看不清屏幕的用户用。它开着时，用户在屏幕上左右轻扫，读屏按顺序停在一个个**元素**上，把它念出来；双击屏幕等于点当前停着的元素。一个元素被念出来的内容由四个属性决定：[`accessibilityLabel`](../api/ui-view/accessibilitylabel.md)（名字）、[`accessibilityValue`](../api/ui-view/accessibilityvalue.md)（值）、[`accessibilityTraits`](../api/ui-view/accessibilitytraits.md)（特征）、[`accessibilityHint`](../api/ui-view/accessibilityhint.md)（提示）。

这一篇里读屏「念什么」「怎么念」的效果都来自 Apple 的文档，没有开着旁白听过，**未在真机验证**。属性的读写、默认值、写错时的处理在真机上验过。

## 推荐的做法

- **系统控件上有文字的，不用设。** `UILabel` 的名字取它显示的文字，`UIButton` 自带「按钮」的特征（实测）。
- **只有图标、没有文字的按钮，一定要设 `accessibilityLabel`。** 否则读屏没有字可念。
- **自己用 `UIView` 拼出来、要当成一个东西看的（卡片、列表的一行、自己做的控件），设 `isAccessibilityElement = true`**，再给它名字和特征。
- **名字说它是什么，值说它现在是多少，提示说操作它会怎样。** 名字里不写「按钮」这类类型，类型由特征念出来。
- **状态变了，同时改特征或者值。** 选中了加 `'selected'`，数变了写新的 `accessibilityValue`。它们不会自己跟着界面变。
- **自己用视图做的弹层，设 `accessibilityViewIsModal = true`**，直接加在页面的根视图上。
- **做完开着旁白在真机上走一遍**，见[开着旁白听一遍](#开着旁白听一遍)。

## 第一个例子

从空白 App 开始，做一个账户页：一个标题、一张余额卡片、一个只有图标的刷新按钮。

```js
application.addEventListener('sceneconnect', (e) => {
  const win = new UIWindow(e.scene);
  const page = new UIViewController();
  page.view.backgroundColor = 'systemBackground';
  win.rootViewController = page;
  win.makeKeyAndVisible();

  // 1. 标题：标成标题，读屏用户可以按标题跳到这里
  const heading = new UILabel();
  heading.text = '我的账户';
  heading.font = UIFont.boldSystemFontOfSize(28);
  heading.accessibilityTraits = ['header'];

  // 2. 余额卡片：两行字合成一个元素，名字是「余额」，值是金额
  const caption = new UILabel();
  caption.text = '余额';
  caption.textColor = 'secondaryLabel';
  const amount = new UILabel();
  amount.text = '¥1,280.00';
  amount.font = UIFont.boldSystemFontOfSize(22);
  const card = new UIStackView([caption, amount]);
  card.axis = 'vertical';
  card.spacing = 4;
  card.isAccessibilityElement = true;
  card.accessibilityLabel = '余额';
  card.accessibilityValue = amount.text;

  // 3. 只有图标的按钮：给它一个名字和一句提示
  const refresh = UIButton.buttonWithType('system');
  refresh.setImage(UIImage.systemImageNamed('arrow.clockwise'), { forState: ['normal'] });
  refresh.accessibilityLabel = '刷新余额';
  refresh.accessibilityHint = '重新获取账户余额';
  refresh.addEventListener('click', () => {
    console.log('刷新');
  });

  // 4. 从上往下排成一列
  const column = new UIStackView([heading, card, refresh]);
  column.axis = 'vertical';
  column.spacing = 16;
  column.alignment = 'leading';
  column.translatesAutoresizingMaskIntoConstraints = false;
  page.view.addSubview(column);
  const safe = page.view.safeAreaLayoutGuide;
  NSLayoutConstraint.activateConstraints([
    column.topAnchor.constraintEqualToAnchor(safe.topAnchor, { constant: 24 }),
    column.leadingAnchor.constraintEqualToAnchor(safe.leadingAnchor, { constant: 16 }),
  ]);
});
```

**效果**

- 屏幕左上方从上往下是：大字「我的账户」，灰色的「余额」，粗体的「¥1,280.00」，一个刷新图标。
- 点刷新图标，控制台输出 `刷新`。
- 开着旁白从上往下轻扫，读屏依次停在三个元素上：念「我的账户」并说明是标题；念「余额，¥1,280.00」，不分别停在两行字上；念「刷新余额」并说明是按钮，稍等一下再念「重新获取账户余额」。**读屏的部分未在真机验证。**

下面各节沿用 `page` 这个变量。单独试某一节时，先写这一行：

```js
const page = new UIViewController();
```

## 决定读屏停在哪些视图上

读屏停不停在一个视图上，由 [`isAccessibilityElement`](../api/ui-view/isaccessibilityelement.md) 决定：

- **`UIView` 默认是 `false`。** 读屏不停在它上面，穿过它去找它的子视图。所以一个只用来装东西的容器，什么都不用设。
- **系统控件由系统决定。** `UILabel`、`UIButton` 这类控件不用设。它们不在窗口里时读到 `false`（实测）；放进窗口之后读到的值**未在真机验证**。
- **设成 `true` 之后，读屏把这个视图当成一个整体，不再停在它的子视图上。** 子视图里要紧的文字，要写进这个视图的名字或值里，否则读屏用户听不到。

所以 `true` 只设在「用户眼里是一个东西」的视图上，比如一张卡片、列表的一行。里面还有别的按钮要单独操作的容器，不要设成 `true`：设了之后里面的按钮读屏停不上去。

```js
const row = new UIView();
const name = new UILabel();
name.text = '张三';
const status = new UILabel();
status.text = '在线';
row.addSubview(name);
row.addSubview(status);

row.isAccessibilityElement = true;
row.accessibilityLabel = '张三，在线';
```

**效果**：读屏停在整行上，一次念「张三，在线」，不再分别停在两个标签上。**未在真机验证。**

## 名字、提示和值各放什么

| 属性 | 放什么 | 例子 |
| --- | --- | --- |
| [`accessibilityLabel`](../api/ui-view/accessibilitylabel.md) | 它是什么。几个词，不成句 | 「刷新余额」「订单 1024」 |
| [`accessibilityValue`](../api/ui-view/accessibilityvalue.md) | 它现在的数值或状态，会变的那部分 | 「¥1,280.00」「50%」「3 件」 |
| [`accessibilityHint`](../api/ui-view/accessibilityhint.md) | 操作它会怎样。名字已经说清楚时不写 | 「打开订单详情」 |

读屏先念名字，再念值和特征，最后稍等一下念提示（来自 Apple 的文档，**未在真机验证**）。写的时候注意几件事：

- **名字里不写类型。** 「按钮」「链接」「标题」由[特征](#特征怎么选)念出来，写进名字会念两遍。
- **名字里不写会变的东西。** 金额、进度、件数放进值里，名字保持不变。
- **提示不放必要的信息。** 用户可以在系统设置里关掉提示，关了就不念。
- **App 支持几种语言时，这三个也按语言写。** 它们是念给用户听的文字，和界面上的文字一样。
- `UILabel` 不设名字时，读屏念它显示的文字（实测：读屏开着时 `accessibilityLabel` 读到的是标签的文字）。只在要念的和显示的不一样时才设。

值不会自己跟着界面变。界面上的数变了，同时写一次值：

```js
const amount = new UILabel();
const card = new UIView();
card.isAccessibilityElement = true;
card.accessibilityLabel = '余额';

/** @param {string} text */
function showBalance(text) {
  amount.text = text;
  card.accessibilityValue = text;
}
showBalance('¥1,320.00');
console.log(card.accessibilityValue);
```

**效果**：控制台输出 `¥1,320.00`。读屏下一次停在卡片上时念新的金额。**读屏的部分未在真机验证。**

## 特征怎么选

[特征](../api/ui-view/accessibilitytraits.md)告诉读屏这是什么样的东西、处在什么状态。读屏据此在名字后面补一句「按钮」「标题」这类说明，读屏用户也可以按特征跳着找，比如只在标题之间跳。

| 界面上的东西 | 特征 |
| --- | --- |
| 自己做的、可以点的视图 | `['button']` |
| 点了打开一个网址或者别的页面 | `['link']` |
| 一段内容的标题 | `['header']` |
| 一张有意义的图片 | `['image']`，再用名字说图上是什么 |
| 一组切换页面的标签 | `['tabBar']` |
| 选中的那一项 | 在原来的特征上加 `'selected'` |
| 暂时不能用 | 在原来的特征上加 `'notEnabled'` |

- 系统控件自带特征：`UIButton` 的特征里有 `'button'`，`UILabel` 的特征里有 `'staticText'`（实测）。
- 写入的数组**整个替换**原来的特征。要在原有的基础上加一个，先读出来再拼：`[...view.accessibilityTraits, 'selected']`。
- 读出来的顺序不是写入的顺序。判断有没有某个特征用 `includes()`。
- 数组里有一个名字写错，整次赋值不生效，控制台输出一条警告，列出全部可选的名字（实测）。

选中状态变了，特征跟着改：

```js
const tab = new UIView();
tab.isAccessibilityElement = true;
tab.accessibilityLabel = '全部订单';

/** @param {boolean} selected */
function setSelected(selected) {
  tab.accessibilityTraits = selected ? ['button', 'selected'] : ['button'];
}
setSelected(true);
console.log(tab.accessibilityTraits.includes('selected'));
```

**效果**：控制台输出 `true`。读屏停在这里时念「全部订单」，并说明它已选中、是按钮。**读屏的部分未在真机验证。**

## 自己做的控件：把几个子视图合成一个元素

一个自己拼的勾选框：左边一个方框图标，右边一行字，点整行切换勾选。对读屏用户来说它是一个可以点、有选中状态的东西，所以把整行设成一个元素，名字取那行字，特征是按钮，勾上时加 `'selected'`。

```js
const box = new UIImageView();
box.image = UIImage.systemImageNamed('square');
const text = new UILabel();
text.text = '记住我';
const row = new UIStackView([box, text]);
row.spacing = 8;

row.isAccessibilityElement = true;
row.accessibilityLabel = text.text;
row.accessibilityTraits = ['button'];

let checked = false;
const tap = new UITapGestureRecognizer();
tap.addEventListener('ended', () => {
  checked = !checked;
  box.image = UIImage.systemImageNamed(checked ? 'checkmark.square.fill' : 'square');
  row.accessibilityTraits = checked ? ['button', 'selected'] : ['button'];
});
row.addGestureRecognizer(tap);
page.view.addSubview(row);
```

**效果**

- 手指点这一行，方框在空和打勾之间切换。
- 读屏停在整行上，念「记住我」并说明是按钮；勾上之后再停到这里，还会说明它已选中。
- 开着旁白时双击屏幕，等于点这一行的正中间，勾选照样切换。

**读屏的部分未在真机验证。**

## 弹层：让读屏只在里面转

自己用视图做的弹层盖在页面上时，眼睛看得出下面的内容被挡住了，读屏却还会停到下面的按钮上。给弹层设 [`accessibilityViewIsModal`](../api/ui-view/accessibilityviewismodal.md)，读屏就只在弹层里面转。

```js
const message = new UILabel();
message.text = '确定要退出登录吗？';
const confirm = UIButton.buttonWithType('system');
confirm.setTitle('退出登录', { forState: ['normal'] });

const sheet = new UIStackView([message, confirm]);
sheet.axis = 'vertical';
sheet.spacing = 12;
sheet.backgroundColor = 'secondarySystemBackground';
sheet.frame = new CGRect(24, 200, 320, 140);
sheet.accessibilityViewIsModal = true;
page.view.addSubview(sheet);   // 直接加在页面的根视图上

confirm.addEventListener('click', () => {
  sheet.removeFromSuperview();
});
```

**效果**

- 页面上出现一块灰底的弹层，上面一行字和一个「退出登录」按钮。
- 读屏只在「确定要退出登录吗？」和「退出登录」两个元素之间转，页面上被盖住的内容都跳过。
- 点「退出登录」，弹层消失，读屏又能停到页面上的内容。

**读屏的部分未在真机验证。**

> **注意**：读屏只跳过弹层的兄弟视图，也就是和它同一个父视图的那些视图（来自 Apple 的文档）。弹层要直接加在被盖住的内容的父视图上，通常是页面的根视图 `page.view`。把它包在另一个容器里再加上去，容器外面的内容读屏照样会停。

## 跳过纯装饰的内容

背景图案、分隔用的花纹这类视图，对读屏用户没有意义。给装它们的视图设 [`accessibilityElementsHidden`](../api/ui-view/accessibilityelementshidden.md)，读屏跳过里面的全部元素：

```js
const decoration = new UIView();
decoration.addSubview(new UIImageView());
decoration.accessibilityElementsHidden = true;
page.view.addSubview(decoration);
```

**效果**：图案照常显示，读屏不停在它上面。**读屏的部分未在真机验证。**

## 让两栏的内容一栏一栏地念

读屏默认按位置排顺序：从上到下，同一行从左到右。左右两栏并排时，它会左一个右一个交替着念。给每一栏设 [`shouldGroupAccessibilityChildren`](../api/ui-view/shouldgroupaccessibilitychildren.md)，读屏念完一栏再念另一栏：

```js
const left = new UIStackView();
left.axis = 'vertical';
const right = new UIStackView();
right.axis = 'vertical';
left.shouldGroupAccessibilityChildren = true;
right.shouldGroupAccessibilityChildren = true;
const columns = new UIStackView([left, right]);
page.view.addSubview(columns);
```

**效果**：读屏先念完 `left` 里的全部元素，再念 `right` 里的。**读屏的部分未在真机验证。**

## 给界面自动化测试留标识

界面自动化测试（比如 Xcode 自带的 XCUITest）要按某个名字找到按钮去点。不要让它按 `accessibilityLabel` 找：名字会按语言翻译、会改写。给它单独的 [`accessibilityIdentifier`](../api/ui-view/accessibilityidentifier.md)，读屏不念它：

```js
const submit = UIButton.buttonWithType('system');
submit.setTitle('提交订单', { forState: ['normal'] });
submit.accessibilityIdentifier = 'checkout-submit';
```

**效果**：读屏照常念「提交订单」。测试代码用 `checkout-submit` 找到这个按钮，按钮上的文字怎么改都不受影响。

## 开着旁白听一遍

这一篇的效果要在真机上开着旁白才听得到：

1. 打开「设置」→「辅助功能」→「旁白」，打开旁白。
2. 在「设置」→「辅助功能」→「辅助功能快捷键」里选「旁白」。之后连按三次侧边按钮，就能开关旁白。
3. 开着旁白时：左右轻扫换到上一个、下一个元素；双击屏幕点当前元素；单指点一下屏幕上的东西，读屏停到那里。

开着旁白时，普通的点按不再直接点下去，先关掉旁白再照常操作。

## 参见

- [`UIView`](../api/ui-view.md)：全部无障碍属性
- [`UIButton`](../api/ui-button.md)、[`UILabel`](../api/ui-label.md)：自带名字和特征的系统控件
- [响应手势](gestures.md)：让自己拼的视图响应点按
- [弹出提示框和菜单](alerts.md)：系统的弹窗
