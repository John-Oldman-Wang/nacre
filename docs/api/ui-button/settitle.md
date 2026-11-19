---
type: reference
native: "-[UIButton setTitle:forState:]"
---

# `UIButton`：`setTitle()` 方法

**`setTitle()`** 方法给按钮的一个或几个状态设文字。按钮按当前状态显示对应的那一个。

## 语法

```
setTitle(value, { forState })
```

### 参数

**`value`**

要显示的文字，字符串。传 `null` 去掉这几个状态的设置，它们回到使用 `normal` 的。**传 `null` 的效果未在模拟器验证。**

**`options.forState`**

状态名的数组，必填。给哪些状态设，见[状态](../ui-button.md#状态)。只设 `['normal']` 时，没有单独设过的状态都用它。几个状态同时成立时才用的值，把这几个状态名都写进数组，比如 `['selected', 'disabled']`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没有传 `forState`：`setTitle needs { forState }`。
- `forState` 里有不认识的状态名：`forState has no value "pressed"; expected one of: …`，后面列出全部状态名。


## 示例

```js
const button = UIButton.buttonWithType('system');
button.setTitle('点我', { forState: ['normal'] });
button.setTitle('松手！', { forState: ['highlighted'] });
```

**效果**：平常显示「点我」，手指按住时显示「松手！」，松开变回「点我」。

## 对应的 iOS API

`-[UIButton setTitle:forState:]`。状态在 ObjC 里是位掩码 `UIControlStateSelected | UIControlStateDisabled`，这里写成数组 `['selected', 'disabled']`。

## 参见

- [`titleForState()`](titleforstate.md)：读某个状态的文字
- [`setAttributedTitle()`](setattributedtitle.md)：混用多种字体和颜色的文字
- [状态](../ui-button.md#状态)
