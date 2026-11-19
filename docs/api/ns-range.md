---
type: reference
native: NSRange
---

# `NSRange`

**`NSRange`** 表示一段文字的范围：从 [`location`](ns-range/location.md) 开始的 [`length`](ns-range/length.md) 个 UTF-16 码元。

单位和 JS 字符串的下标相同。所以 `text.slice(location, location + length)` 取出来的就是这一段，`text.length` 就是最大的 `location`。大多数字符占一个码元，表情和一部分汉字占两个。`length` 是 0 表示一个位置，没有内容，在输入框里就是光标。

用到它的地方：[`UITextField`](ui-text-field.md) 和 [`UITextView`](ui-text-view.md) 的 `selectedRange`、`UITextView.scrollRangeToVisible()`、`UITextField` 的 `beforeinput` 事件，以及[富文本](ns-attributed-string.md)里所有带范围的方法。

`NSRange` 是[结构体](structs.md)：一个值，不是一个对象的引用。规矩和 `CGRect` 那一组相同：

- **字段只读。** 要改就整体换一个新的。
- **写入时可以给普通对象。** 要 `NSRange` 的地方，`{ location: 3, length: 0 }` 和 `new NSRange(3, 0)` 等价。读出来的永远是 `NSRange`。
- **每次读得到一个新对象。** `input.selectedRange === input.selectedRange` 是 `false`。比较两个范围时比字段。
- **转成字符串**是 `NSRange(3, 0)`，过 `JSON.stringify` 是 `{"location":3,"length":0}`。

**继承关系**：`NSRange`。它不继承 `NSObject`。

## 构造函数

[`NSRange()`](ns-range/constructor.md)

用起点和长度创建一个范围。

## 实例属性

| 属性 | 说明 |
| --- | --- |
| [`location`](ns-range/location.md) <small>只读</small> | 这一段从哪里开始 |
| [`length`](ns-range/length.md) <small>只读</small> | 这一段有多长 |

## 示例

### 选中一个表情

```js
const input = new UITextView();
input.text = 'a😀b';
console.log(input.text.length);
input.selectedRange = new NSRange(1, 2);
console.log(String(input.selectedRange));
```

**结果**：输出 `4` 和 `NSRange(1, 2)`。`(1, 2)` 正好选中那个表情（实测）。

> **注意**：把光标放在一个表情的两个码元中间（上面的例子里是 `new NSRange(2, 0)`）不会被纠正。在那里插入文字会把表情拆成两半（实测）。自己算位置时要避开。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `NSMakeRange(0, 5)` | `new NSRange(0, 5)` |
| `range.location` | `range.location` |
| `range.length` | `range.length` |
| `NSMaxRange(range)` | `range.location + range.length` |
| `NSStringFromRange(range)` | `String(range)`，得到 `NSRange(0, 5)` |

## 参见

- [结构体](structs.md)：所有结构体共同的规矩
- [`UITextView` 的 `selectedRange`](ui-text-view/selectedrange.md)、[`UITextField` 的 `selectedRange`](ui-text-field/selectedrange.md)
- [富文本](ns-attributed-string.md)
