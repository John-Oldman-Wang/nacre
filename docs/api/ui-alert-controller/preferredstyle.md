---
type: reference
native: UIAlertController.preferredStyle
---

# `UIAlertController`：`preferredStyle` 属性

**`preferredStyle`** 属性是弹窗的样式，创建时确定。

## 值

字符串：

| 取值 | 效果 |
| --- | --- |
| `'alert'` | 提示框，出现在屏幕中间，可以带输入框 |
| `'actionSheet'` | 底部菜单，从屏幕底部升起来，不能带输入框 |

- 只读。给它赋值抛 `TypeError`。
- 值是创建时 [`alertControllerWithTitle()`](alertcontrollerwithtitle.md) 的 `options.preferredStyle`。要换样式，新建一个弹窗。

## 示例

```js
const menu = UIAlertController.alertControllerWithTitle(null, {
  preferredStyle: 'actionSheet',
});
console.log(menu.preferredStyle);
```

**结果**：控制台输出 `actionSheet`。

## 对应的 iOS API

`UIAlertController.preferredStyle`。`UIAlertControllerStyleActionSheet` 写成 `'actionSheet'`。

## 参见

- [两种样式](../ui-alert-controller.md#两种样式)
