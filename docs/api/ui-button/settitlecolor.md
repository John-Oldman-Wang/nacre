---
type: reference
native: "-[UIButton setTitleColor:forState:]"
---

# `UIButton`：`setTitleColor()` 方法

**`setTitleColor()`** 方法给按钮的一个或几个状态设文字颜色。按钮按当前状态显示对应的那一个。

## 语法

```
setTitleColor(value, { forState })
```

### 参数

**`value`**

[颜色](../ui-color.md)：颜色字符串（`'#FF3B30'`、`'systemRed'`）或 `UIColor` 对象。传 `null` 去掉这几个状态的设置，它们回到使用 `normal` 的。**传 `null` 的效果未在模拟器验证。**

**`options.forState`**

状态名的数组，必填。给哪些状态设，见[状态](../ui-button.md#状态)。只设 `['normal']` 时，没有单独设过的状态都用它。几个状态同时成立时才用的值，把这几个状态名都写进数组，比如 `['selected', 'disabled']`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

- 没有传 `forState`：`setTitleColor needs { forState }`。
- `forState` 里有不认识的状态名：`forState has no value "pressed"; expected one of: …`，后面列出全部状态名。


颜色字符串写错时不抛异常：控制台输出一条警告，这几个状态的颜色保持不变。

## 示例

```js
const button = UIButton.buttonWithType('system');
button.setTitle('删除', { forState: ['normal'] });
button.setTitleColor('#FF3B30', { forState: ['normal'] });
```

**效果**：文字变成红色。手指按住时仍然自动变淡。

## 对应的 iOS API

`-[UIButton setTitleColor:forState:]`。状态在 ObjC 里是位掩码 `UIControlStateSelected | UIControlStateDisabled`，这里写成数组 `['selected', 'disabled']`。

## 参见

- [`titleColorForState()`](titlecolorforstate.md)
- [颜色](../ui-color.md)：颜色的写法
- [状态](../ui-button.md#状态)
