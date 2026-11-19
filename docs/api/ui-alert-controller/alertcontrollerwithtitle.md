---
type: reference
native: "+[UIAlertController alertControllerWithTitle:message:preferredStyle:]"
---

# `UIAlertController.alertControllerWithTitle()` 静态方法

**`UIAlertController.alertControllerWithTitle()`** 静态方法创建一个弹窗。弹窗只能用这个方法创建，不能用 `new`。

## 语法

```
UIAlertController.alertControllerWithTitle(title, { message, preferredStyle })
```

### 参数

**`title`**

标题，字符串或 `null`，必填。`null` 是没有标题。不是字符串时转成字符串，比如 `5` 变成 `'5'`。之后从继承来的 [`title`](../ui-view-controller/title.md) 读写。

**`options.message`**

标题下面的说明文字，字符串或 `null`，可选。不给或给 `null` 是没有。不是字符串时转成字符串。

**`options.preferredStyle`**

样式，必填：

| 取值 | 效果 |
| --- | --- |
| `'alert'` | 提示框，出现在屏幕中间，可以带输入框 |
| `'actionSheet'` | 底部菜单，从屏幕底部升起来，不能带输入框 |

样式之后不能改，见 [`preferredStyle`](preferredstyle.md)。两种样式在屏幕上的样子**未在模拟器验证**。

### 返回值

新建的 `UIAlertController`。每次调用得到一个新的。新弹窗没有按钮，`actions` 和 `textFields` 都是空数组。

### 异常

**`TypeError`**

`preferredStyle` 没给或者不认识，比如 `preferredStyle has no value "modal"; expected one of: actionSheet / alert`。

## 示例

```js
const alert = UIAlertController.alertControllerWithTitle('标题', {
  message: '说明文字',
  preferredStyle: 'alert',
});
console.log(alert.title, alert.message, alert.preferredStyle);
```

**结果**：控制台输出 `标题 说明文字 alert`。

```js
const menu = UIAlertController.alertControllerWithTitle(null, {
  preferredStyle: 'actionSheet',
});
console.log(menu.title, menu.message);
```

**结果**：控制台输出 `null null`。底部菜单的标题和说明都可以是 `null`，这时菜单里只有按钮。

## 对应的 iOS API

`+[UIAlertController alertControllerWithTitle:message:preferredStyle:]`。`message` 放进 options；`UIAlertControllerStyleAlert` 写成 `'alert'`，`UIAlertControllerStyleActionSheet` 写成 `'actionSheet'`。

## 参见

- [两种样式](../ui-alert-controller.md#两种样式)
- [`addAction()`](addaction.md)：给弹窗加按钮
