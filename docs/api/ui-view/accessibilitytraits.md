---
type: reference
native: UIView.accessibilityTraits
---

# `UIView`：`accessibilityTraits` 属性

**`accessibilityTraits`** 属性说明这个元素是什么样的东西、处在什么状态：按钮、标题、图片、已选中、不可用……读屏按它决定怎么念、用户能怎么操作。

读屏（VoiceOver，系统设置里叫「旁白」）是 iOS 自带的屏幕阅读器，见 [`isAccessibilityElement`](isaccessibilityelement.md)。

## 值

字符串数组，每个元素是下面的名字之一。一个元素可以同时有几个特征，比如 `['button', 'selected']`。空数组表示没有任何特征。

各特征的含义和效果来自 Apple 的文档，读屏实际怎么念**未在真机验证**。

说明是什么东西的：

| 取值 | 含义 |
| --- | --- |
| `'button'` | 按钮。读屏念完名字后说明它是按钮 |
| `'link'` | 链接，激活它会打开一个网址或者别的页面 |
| `'header'` | 标题，一段内容的开头。读屏用户可以只在标题之间跳着找内容 |
| `'searchField'` | 搜索框 |
| `'image'` | 图片 |
| `'staticText'` | 不会变的文字 |
| `'keyboardKey'` | 键盘上的一个键 |
| `'tabBar'` | 一组标签，用来在几个页面之间切换。标在装着这组标签的那个视图上，这个视图本身的 `isAccessibilityElement` 要是 `false`，里面的每个标签才是元素 |
| `'toggleButton'` | 开关式的按钮，点一下在打开和关闭之间切换 |
| `'summaryElement'` | App 启动时概括当前状况的元素，比如天气 App 里的当前气温。App 启动时读屏先念它 |

说明状态的：

| 取值 | 含义 |
| --- | --- |
| `'selected'` | 已选中，比如一组标签里当前的那一个。读屏会说明它已选中 |
| `'notEnabled'` | 不可用。读屏会说明它不可用 |
| `'updatesFrequently'` | 值变得很频繁，比如计时器。读屏不会每变一次都念 |

说明怎么操作的：

| 取值 | 含义 |
| --- | --- |
| `'adjustable'` | 可以调大调小的值，比如滑块（`UISlider` 自带这个特征） |
| `'allowsDirectInteraction'` | 用户直接用手指操作它，读屏不拦截触摸，比如画板、乐器的键 |
| `'playsSound'` | 激活时自己会发出声音，读屏不再播放它自己的提示音 |
| `'startsMediaSession'` | 激活时开始播放或录制。读屏激活它时不出声，免得声音混进录音 |
| `'causesPageTurn'` | 读屏连续朗读时，念完这个元素自动翻到下一页 |
| `'supportsZoom'` | 可以放大缩小 |

- 可读，可写。
- `UIView` 的默认值是空数组 `[]`。系统控件带着自己的特征：`UIButton` 的特征里有 `'button'`，`UILabel` 的特征里有 `'staticText'`（实测）。
- 每次读得到一个新数组。数组里的顺序是系统内部的固定顺序，不是写入时的顺序。判断有没有某个特征用 `includes()`，比较两组特征先排序。
- 写入的数组整个替换原来的特征，不是追加。要在原有的基础上加一个，先读出来：`[...view.accessibilityTraits, 'selected']`。
- 写空数组去掉全部特征。
- 系统控件身上可能还带着上表以外、没有名字的特征。它们读不出来，写入时也原样保留，不会被去掉。
- 写入时也接受别的可迭代对象，比如 `Set`。
- 没有变化事件：除了系统控件自带的那些，改它的只有 App 自己的代码。

### 写错时

数组里有一个不认识的名字时，整次赋值不生效：不抛异常，控制台输出一条警告，列出全部可选值，属性保持原值（实测）。

```
accessibilityTraits has no value "heading"; expected one of: …
```

写入的不是数组时抛 `TypeError`，属性保持原值（实测）：

```
TypeError: accessibilityTraits must be an array of trait names, got "button"
```

## 示例

### 把一行字标成标题

```js
const title = new UILabel();
title.text = '最近订单';
title.accessibilityTraits = ['header'];
console.log(title.accessibilityTraits.join(','));
```

**效果**：控制台输出 `header`。`UILabel` 原有的 `'staticText'` 被换掉了。读屏念「最近订单」并说明它是标题，用户可以按标题跳到这里。**读屏怎么念未在真机验证。**

### 跟着选中状态改特征

```js
const tab = new UIView();
tab.isAccessibilityElement = true;
tab.accessibilityLabel = '全部';

/** @param {boolean} selected */
function setSelected(selected) {
  tab.accessibilityTraits = selected ? ['button', 'selected'] : ['button'];
}
setSelected(true);
console.log(tab.accessibilityTraits.includes('selected'));
```

**效果**：控制台输出 `true`。读屏停在这里时念「全部」，并说明它已选中、是按钮。**读屏怎么念未在真机验证。**

## 对应的 iOS API

`accessibilityTraits`。在 iOS 里它属于 `UIAccessibility` 协议，是一个位掩码；JS 里只在 `UIView` 和它的子类上有。常量去掉 `UIAccessibilityTrait` 前缀、首字母小写：`UIAccessibilityTraitButton | UIAccessibilityTraitSelected` 写成 `['button', 'selected']`。`UIAccessibilityTraitNone` 写成空数组。

## 参见

- [让读屏念对你的界面](../../guides/accessibility.md#特征怎么选)：特征怎么选
- [枚举](../enums.md)：位掩码写成字符串数组，属性写错时是警告
