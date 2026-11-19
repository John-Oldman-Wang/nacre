---
type: reference
native: UISearchBar.inputAccessoryView
---

# `UISearchBar`：`inputAccessoryView` 属性

**`inputAccessoryView`** 属性是键盘弹出时贴在键盘上面的视图。常见的做法是放一条 [`UIToolbar`](../ui-toolbar.md)，上面一个「完成」按钮。

## 值

[`UIView`](../ui-view.md)，或者 `null`。

- 可读，可写。
- 默认值是 `null`。
- 读回来的是写进去的那个对象。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

- 写了不是视图的原生对象：抛 `TypeError: inputAccessoryView needs a UIView or null`。
- 写了数、字符串等普通值：抛 `TypeError: inputAccessoryView needs a native object or null, got 5`。

两种情况下原值不变。

## 示例

```js
const search = new UISearchBar();
const bar = new UIToolbar();
const done = UIBarButtonItem.systemItem('done');
done.addEventListener('click', () => search.resignFirstResponder());
bar.items = [UIBarButtonItem.flexibleSpace(), done];
bar.sizeToFit();
search.inputAccessoryView = bar;
```

**效果**：键盘弹出时，键盘上面多一条工具条，右端是「完成」。点它，键盘收起。**未在模拟器验证。**

## 对应的 iOS API

`UISearchBar.inputAccessoryView`。

## 参见

- [`UIToolbar`](../ui-toolbar.md)
