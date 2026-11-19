---
type: reference
native: "-[UITextView scrollRangeToVisible:]"
---

# `UITextView`：`scrollRangeToVisible()` 方法

**`scrollRangeToVisible()`** 方法滚动多行输入，直到这一段文字看得见为止。

## 语法

```
scrollRangeToVisible(range)
```

### 参数

**`range`**

要看见的那一段，[`NSRange`](../ns-range.md)，或者普通对象 `{ location, length }`。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

参数不对时的报错和写 [`selectedRange`](selectedrange.md) 相同，开头换成 `scrollRangeToVisible`。比如缺字段：`scrollRangeToVisible is missing length, or it is not a finite number`。

## 说明

范围超出内容时不抛错，也不滚动（实测）。

## 示例

```js
const input = new UITextView();
input.frame = new CGRect(0, 0, 200, 60);
input.text = Array.from({ length: 40 }, (_, i) => '第 ' + (i + 1) + ' 行').join('\n');
input.scrollRangeToVisible(new NSRange(input.text.length, 0));
console.log(input.contentOffset.y > 0);
```

**结果**：输出 `true`：滚动到了内容的末尾。实测一块 200 × 60 pt、内容 40 行的多行输入，调用之后 `contentOffset.y` 从 0 变成 788。

## 对应的 iOS API

`-[UITextView scrollRangeToVisible:]`。

## 参见

- [`contentOffset`](../ui-scroll-view/contentoffset.md)
