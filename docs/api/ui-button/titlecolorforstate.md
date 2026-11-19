---
type: reference
native: "-[UIButton titleColorForState:]"
---

# `UIButton`：`titleColorForState()` 方法

**`titleColorForState()`** 方法返回按钮在某个状态下使用的文字颜色。

## 语法

```
titleColorForState(state)
```

### 参数

**`state`**

一个状态名，字符串：`'normal'`、`'highlighted'`、`'disabled'`、`'selected'`、`'focused'` 之一。

和设置的方法不同，这里只能传一个状态名，不能传数组。

### 返回值

[颜色](../ui-color.md)字符串，或者 `null`。用颜色字符串设的，原样返回那个字符串；用 `UIColor` 的系统颜色常量设的，返回它的名字（比如 `'systemRed'`）。

这个状态没有单独设过时，返回 `normal` 状态的那一个。`normal` 也没设过时返回 `null`。

### 异常

**`TypeError`**

`state` 不是上面的状态名之一。

## 示例

```js
const button = UIButton.buttonWithType('system');
button.setTitleColor(UIColor.systemRedColor, { forState: ['normal'] });
console.log(button.titleColorForState('normal'));
```

**结果**：输出 `systemRed`。

## 对应的 iOS API

`-[UIButton titleColorForState:]`。

## 参见

- [`setTitleColor()`](settitlecolor.md)
- [`current…` 属性](../ui-button.md#实例属性)：读按钮此刻显示的那一个
