---
type: reference
native: UITextField.inputAccessoryView
---

# `UITextField`：`inputAccessoryView` 属性

**`inputAccessoryView`** 属性是键盘弹出时贴在键盘上面的视图。它跟着键盘一起出现和消失。最常见的是放一条 [`UIToolbar`](../ui-toolbar.md)，上面一个「完成」按钮。

## 值

[`UIView`](../ui-view.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 读回来的是写进去的那个对象。
- 写 `null` 或 `undefined` 是去掉。
- 它的宽度由系统拉到和键盘一样宽，高度用它自己的。工具条要先调 `sizeToFit()` 量出自己的高度，新建的工具条高度是 0，不调它不占位置。**未在模拟器验证。**
- 同一个视图可以写给几个输入框，也可以同时写给[搜索框](../ui-search-bar/inputaccessoryview.md)和[多行输入](../ui-text-view/inputaccessoryview.md)。
- 输入框正在输入时写入，当场生效；写 `null` 当场去掉。输入框不会因此失去焦点。**未在模拟器验证。**
- 写进去的视图不要再用 `addSubview()` 放进页面：键盘弹出时系统把它放到键盘上方，它在页面里原来的位置就没有了。**未在模拟器验证。**
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

- 写了不是视图的原生对象：抛 `TypeError: inputAccessoryView needs a UIView or null`。
- 写了数、字符串等普通值：抛 `TypeError: inputAccessoryView needs a native object or null, got 5`。

两种情况下原值不变。

## 示例

```js
const field = new UITextField();
field.keyboardType = 'decimalPad';

const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => field.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
field.inputAccessoryView = bar;
```

**效果**：点输入框弹出数字键盘，键盘上面多一条工具条，右端是「完成」。点它，键盘收起，工具条跟着消失。**未在模拟器验证**；验收用例里有「输入框聚焦之后这个视图出现在屏幕上」的断言，它们写完之后还没有运行过。

## 对应的 iOS API

`UITextField.inputAccessoryView`。换了之后不需要调 `reloadInputViews`，写入当场生效。

## 参见

- [`UIToolbar`](../ui-toolbar.md)
- [`inputView`](inputview.md)：代替整个键盘的视图
