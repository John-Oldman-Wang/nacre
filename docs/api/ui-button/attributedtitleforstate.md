---
type: reference
native: "-[UIButton attributedTitleForState:]"
---

# `UIButton`：`attributedTitleForState()` 方法

**`attributedTitleForState()`** 方法返回按钮在某个状态下使用的带样式的文字。

## 语法

```
attributedTitleForState(state)
```

### 参数

**`state`**

一个状态名，字符串：`'normal'`、`'highlighted'`、`'disabled'`、`'selected'`、`'focused'` 之一。

和设置的方法不同，这里只能传一个状态名，不能传数组。

### 返回值

[`NSAttributedString`](../ns-attributed-string.md)，或者 `null`。比较内容用 `isEqualToAttributedString()`。

这个状态没有单独设过时，返回 `normal` 状态的那一个。`normal` 也没设过时返回 `null`。

### 异常

**`TypeError`**

`state` 不是上面的状态名之一。

## 示例

```js
const button = UIButton.buttonWithType('system');
const title = new NSAttributedString('提交', { foregroundColor: 'systemBlue' });
button.setAttributedTitle(title, { forState: ['normal'] });

const got = button.attributedTitleForState('disabled');
console.log(got !== null && got.isEqualToAttributedString(title));
```

**结果**：输出 `true`。`disabled` 没有单独设过，返回 `normal` 的。

## 对应的 iOS API

`-[UIButton attributedTitleForState:]`。

## 参见

- [`setAttributedTitle()`](setattributedtitle.md)
- [`current…` 属性](../ui-button.md#实例属性)：读按钮此刻显示的那一个
