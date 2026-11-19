---
type: reference
native: NSMutableAttributedString
status: partial
---

# `NSMutableAttributedString`

**`NSMutableAttributedString`** 表示一段可以改的[富文本](ns-attributed-string.md)：可以给某一段加属性、去掉属性，拼接、插入、替换、删除文字。

它有 [`NSAttributedString`](ns-attributed-string.md) 的全部成员，创建的写法也相同，另外多出下面这些修改的方法。修改的方法都没有返回值；范围越界、缺必填的选项、参数类型不对时抛 `TypeError`。

视图拿走的是赋值那一刻的内容。改了一个已经交给视图的 `NSMutableAttributedString`，视图上显示的不变，要重新赋值一次。

`NSMutableAttributedString` 不派发事件。内容只会被 App 自己的代码修改，所以没有变化通知。

**继承关系**：`EventTarget` → `NSObject` → [`NSAttributedString`](ns-attributed-string.md) → `NSMutableAttributedString`

怎么一段一段建富文本，见指南[显示带样式的文字](../guides/attributed-text.md)。

## 构造函数

[`NSMutableAttributedString()`](ns-mutable-attributed-string/constructor.md)

创建一段可以改的富文本。参数的写法和 [`NSAttributedString()`](ns-attributed-string/constructor.md) 相同。

## 实例属性

`NSMutableAttributedString` 没有自己的属性。还继承 [`NSAttributedString`](ns-attributed-string.md) 的 `string` 和 `length`，改了内容之后它们读出的是新的值。

## 实例方法

还继承 [`NSAttributedString`](ns-attributed-string.md) 的方法：读属性、取一段、比较、量尺寸、副本。

改属性：

| 方法 | 说明 |
| --- | --- |
| [`addAttribute()`](ns-mutable-attributed-string/addattribute.md) | 给一段加一个属性。同名的被覆盖，其他属性不动 |
| [`addAttributes()`](ns-mutable-attributed-string/addattributes.md) | 给一段加一组属性。同名的被覆盖，其他属性不动 |
| [`setAttributes()`](ns-mutable-attributed-string/setattributes.md) | 把一段的属性整个换成这一组 |
| [`removeAttribute()`](ns-mutable-attributed-string/removeattribute.md) | 去掉一段里的一个属性 |

改文字：

| 方法 | 说明 |
| --- | --- |
| [`appendAttributedString()`](ns-mutable-attributed-string/appendattributedstring.md) | 把另一个富文本接在末尾 |
| [`insertAttributedString()`](ns-mutable-attributed-string/insertattributedstring.md) | 插在某个位置前面 |
| [`replaceCharactersInRange()`](ns-mutable-attributed-string/replacecharactersinrange.md) | 把一段文字换成字符串或另一个富文本 |
| [`deleteCharactersInRange()`](ns-mutable-attributed-string/deletecharactersinrange.md) | 删掉一段文字 |
| [`setAttributedString()`](ns-mutable-attributed-string/setattributedstring.md) | 把全部内容换成另一个富文本的内容 |

## 示例

### 给其中一段加颜色

```js
const source = '合计 ¥128.00';
const text = new NSMutableAttributedString(source, { font: UIFont.systemFontOfSize(17) });
const start = source.indexOf('¥');
text.addAttribute('foregroundColor', {
  value: 'systemRed',
  range: new NSRange(start, source.length - start),
});
const label = new UILabel();
label.attributedText = text;
```

**效果**（未在模拟器验证）：「合计」是默认的颜色，「¥128.00」是红色。

### 改文字

```js
const text = new NSMutableAttributedString('abc', { kern: 3 });
text.replaceCharactersInRange(new NSRange(1, 1), { withString: 'XYZ' });
text.insertAttributedString(new NSAttributedString('>'), { atIndex: 0 });
text.deleteCharactersInRange(new NSRange(0, 1));
console.log(text.string);
```

**结果**：控制台输出 `aXYZc`。

## 对应的 iOS API

| ObjC | JS |
| --- | --- |
| `[[NSMutableAttributedString alloc] initWithAttributedString:other]` | `new NSMutableAttributedString(other)` |
| `[text addAttribute:NSKernAttributeName value:@2 range:NSMakeRange(0, 3)]` | `text.addAttribute('kern', { value: 2, range: new NSRange(0, 3) })` |
| `[text setAttributes:attrs range:range]` | `text.setAttributes(attrs, { range })` |
| `[text removeAttribute:NSKernAttributeName range:range]` | `text.removeAttribute('kern', { range })` |
| `[text appendAttributedString:other]` | `text.appendAttributedString(other)` |
| `[text insertAttributedString:other atIndex:0]` | `text.insertAttributedString(other, { atIndex: 0 })` |
| `[text replaceCharactersInRange:range withString:@"x"]` | `text.replaceCharactersInRange(range, { withString: 'x' })` |

## 参见

- [`NSAttributedString`](ns-attributed-string.md)：读属性、量尺寸，以及全部属性名
- [显示带样式的文字](../guides/attributed-text.md)
