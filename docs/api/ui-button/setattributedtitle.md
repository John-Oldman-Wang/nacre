---
type: reference
native: "-[UIButton setAttributedTitle:forState:]"
---

# `UIButton`：`setAttributedTitle()` 方法

**`setAttributedTitle()`** 方法给按钮的一个或几个状态设带样式的文字。按钮按当前状态显示对应的那一个。

## 语法

```
setAttributedTitle(value, { forState })
```

### 参数

**`value`**

[`NSAttributedString`](../ns-attributed-string.md)。设了它的状态不再显示 [`setTitle()`](settitle.md) 给的文字，[`setTitleColor()`](settitlecolor.md) 的颜色在这个状态下也不起作用。传 `null` 去掉这几个状态的设置，它们回到使用 `normal` 的。

**`options.forState`**

状态名的数组，必填。给哪些状态设，见[状态](../ui-button.md#状态)。只设 `['normal']` 时，没有单独设过的状态都用它。几个状态同时成立时才用的值，把这几个状态名都写进数组，比如 `['selected', 'disabled']`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没有传 `forState`：`setAttributedTitle needs { forState }`。
- `forState` 里有不认识的状态名：`forState has no value "pressed"; expected one of: …`，后面列出全部状态名。
- `value` 不是 `NSAttributedString` 也不是 `null`（比如传了字符串）。


## 示例

```js
const button = UIButton.buttonWithType('system');
const bold = UIFont.boldSystemFontOfSize(20);
button.setAttributedTitle(new NSAttributedString('提交', { font: bold, foregroundColor: 'systemBlue' }),
                          { forState: ['normal'] });
button.setAttributedTitle(new NSAttributedString('提交', { font: bold, foregroundColor: 'systemGray' }),
                          { forState: ['highlighted'] });
```

**效果**：平常显示 20 pt 粗体的蓝色「提交」，手指按住时变成灰色。屏幕上的样子**未在模拟器验证**。

## 对应的 iOS API

`-[UIButton setAttributedTitle:forState:]`。状态在 ObjC 里是位掩码 `UIControlStateSelected | UIControlStateDisabled`，这里写成数组 `['selected', 'disabled']`。

## 参见

- [`attributedTitleForState()`](attributedtitleforstate.md)
- [富文本](../ns-attributed-string.md)
- [状态](../ui-button.md#状态)
