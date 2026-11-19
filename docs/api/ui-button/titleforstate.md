---
type: reference
native: "-[UIButton titleForState:]"
---

# `UIButton`：`titleForState()` 方法

**`titleForState()`** 方法返回按钮在某个状态下使用的文字。

## 语法

```
titleForState(state)
```

### 参数

**`state`**

一个状态名，字符串：`'normal'`、`'highlighted'`、`'disabled'`、`'selected'`、`'focused'` 之一。

和设置的方法不同，这里只能传一个状态名，不能传数组。

### 返回值

字符串，或者 `null`。

这个状态没有单独设过时，返回 `normal` 状态的那一个。`normal` 也没设过时返回 `null`。

### 异常

**`TypeError`**

`state` 不是上面的状态名之一。

## 示例

```js
const button = UIButton.buttonWithType('system');
button.setTitle('点我', { forState: ['normal'] });
button.setTitle('松手！', { forState: ['highlighted'] });

console.log(button.titleForState('normal'));
console.log(button.titleForState('highlighted'));
console.log(button.titleForState('disabled'));
```

**结果**：依次输出 `点我`、`松手！`、`点我`。`disabled` 没有单独设过，返回 `normal` 的。

## 对应的 iOS API

`-[UIButton titleForState:]`。

## 参见

- [`setTitle()`](settitle.md)
- [`current…` 属性](../ui-button.md#实例属性)：读按钮此刻显示的那一个
