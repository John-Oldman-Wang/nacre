---
type: reference
native: "-[NSAttributedString initWithString:attributes:]"
---

# `NSAttributedString()` 构造函数

**`NSAttributedString()`** 构造函数创建一段富文本。建好之后内容不能改。

## 语法

```
new NSAttributedString()
new NSAttributedString(string)
new NSAttributedString(string, attributes)
new NSAttributedString(other)
```

### 参数

**`string`**

文字。按字符串转：数字 `5` 得到 `'5'`，`null` 和 `undefined` 得到空串。

**`attributes`**

可选。整段文字用的一组[属性](../ns-attributed-string.md#富文本的属性)，一个对象，键是属性的名字。给 `null` 等于没给。值是 `undefined` 的键视为没带。

**`other`**

另一个 `NSAttributedString`。照它抄一份，文字和属性都相同。

### 返回值

新建的 `NSAttributedString`：

| 写法 | 得到 |
| --- | --- |
| `new NSAttributedString()` | 没有文字的富文本 |
| `new NSAttributedString(string)` | 不带属性的文字 |
| `new NSAttributedString(string, attributes)` | 整段文字用同一组属性 |
| `new NSAttributedString(other)` | 照另一个富文本抄一份 |

### 异常

**`TypeError`**

- `attributes` 不是对象也不是 `null`：`new NSAttributedString: attributes must be an object or null, got …`。
- 属性名写错：`NSAttributedString has no attribute "colour"; expected one of: font / paragraphStyle / …`。
- 字体、段落样式、阴影、附件不是对应的类：比如 `font must be a UIFont, got "Helvetica"`。
- 颜色的值写 `null`：`foregroundColor must be a color string or a UIColor, got null`。
- 线型不是数组，或线型名写错，见[线型](../ns-attributed-string.md#线型)。
- `NSAttributedString` 不能继承，`class X extends NSAttributedString {}` 在 `new X()` 时抛，见[原生类](../native-classes.md)。

颜色字符串写错时不抛：打一条警告，这个键不生效，其他键照常。

## 示例

```js
const text = new NSAttributedString('重要通知', {
  font: UIFont.boldSystemFontOfSize(17),
  foregroundColor: '#ff3b30',
  kern: 2,
});
console.log(text.string, text.length);
```

**结果**：控制台输出 `重要通知 4`。显示出来是四个红色粗体字，字与字之间比平常多空 2 pt（**未在模拟器验证**）。

## 对应的 iOS API

`-[NSAttributedString init]`、`-initWithString:`、`-initWithString:attributes:`、`-initWithAttributedString:`。属性字典的键 `NSFontAttributeName` 写成 `font`，其余同理。

## 参见

- [富文本的属性](../ns-attributed-string.md#富文本的属性)
- [`NSMutableAttributedString()`](../ns-mutable-attributed-string/constructor.md)
