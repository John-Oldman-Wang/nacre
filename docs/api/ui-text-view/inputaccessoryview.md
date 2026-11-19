---
type: reference
native: UITextView.inputAccessoryView
---

# `UITextView`：`inputAccessoryView` 属性

**`inputAccessoryView`** 属性是键盘弹出时贴在键盘上面的视图。多行输入里回车是换行，收键盘的「完成」按钮通常放在这里。

## 值

[`UIView`](../ui-view.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 读回来的是写进去的那个对象。
- 写 `null` 或 `undefined` 是去掉。
- 正在输入时写入，当场生效。**未在模拟器验证。**
- 可以是任何视图，同一个视图可以给几个输入框。其余的规则和 [`UITextField` 的同名属性](../ui-text-field/inputaccessoryview.md)相同。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

- 写了不是视图的原生对象：抛 `TypeError: inputAccessoryView needs a UIView or null`。
- 写了数、字符串等普通值：抛 `TypeError: inputAccessoryView needs a native object or null, got 5`。

两种情况下原值不变。

## 示例

```js
const input = new UITextView();
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => input.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
input.inputAccessoryView = bar;
```

**效果**：点多行输入弹出键盘，键盘上面多一条工具条，右端是「完成」。点它，键盘收起。**未在模拟器验证**；验收用例里有「聚焦之后这个视图出现在屏幕上」的断言，它们写完之后还没有运行过。

## 对应的 iOS API

`UITextView.inputAccessoryView`。换了之后不需要调 `reloadInputViews`。

## 参见

- [`UIToolbar`](../ui-toolbar.md)
- [`inputView`](inputview.md)
