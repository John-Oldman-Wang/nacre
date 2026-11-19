---
type: reference
native: "-[UIButton imageForState:]"
---

# `UIButton`：`imageForState()` 方法

**`imageForState()`** 方法返回按钮在某个状态下使用的图标。

## 语法

```
imageForState(state)
```

### 参数

**`state`**

一个状态名，字符串：`'normal'`、`'highlighted'`、`'disabled'`、`'selected'`、`'focused'` 之一。

和设置的方法不同，这里只能传一个状态名，不能传数组。

### 返回值

[`UIImage`](../ui-image.md)，或者 `null`。返回的是设进去的同一个对象。

这个状态没有单独设过时，返回 `normal` 状态的那一个。`normal` 也没设过时返回 `null`。

### 异常

**`TypeError`**

`state` 不是上面的状态名之一。

## 示例

```js
const button = UIButton.buttonWithType('system');
const heart = UIImage.systemImageNamed('heart');
button.setImage(heart, { forState: ['normal'] });
console.log(button.imageForState('normal') === heart);
```

**结果**：输出 `true`。**未在模拟器验证。**

## 对应的 iOS API

`-[UIButton imageForState:]`。

## 参见

- [`setImage()`](setimage.md)
- [`current…` 属性](../ui-button.md#实例属性)：读按钮此刻显示的那一个
