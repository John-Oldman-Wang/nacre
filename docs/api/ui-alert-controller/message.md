---
type: reference
native: UIAlertController.message
---

# `UIAlertController`：`message` 属性

**`message`** 属性是弹窗标题下面的说明文字。

## 值

字符串，或者 `null`。

- 可读，可写。
- 默认值是创建时 `options.message` 给的；没给是 `null`。
- `null` 是没有说明文字。写入不是字符串的值时转成字符串。
- 弹窗已经在屏幕上时改它，屏幕上跟不跟着变**未在模拟器验证**。
- 变化时不派发事件：它只有 App 自己能改。

## 示例

```js
const alert = UIAlertController.alertControllerWithTitle('保存失败', {
  preferredStyle: 'alert',
});
alert.message = '网络连接断开了，请稍后再试。';
console.log(alert.message);
```

**结果**：控制台输出 `网络连接断开了，请稍后再试。`。

## 对应的 iOS API

`UIAlertController.message`。

## 参见

- [`title`](../ui-view-controller/title.md)：弹窗的标题，继承自页面
