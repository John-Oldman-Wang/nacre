---
type: reference
native: "-[NSMutableAttributedString initWithString:attributes:]"
---

# `NSMutableAttributedString()` 构造函数

**`NSMutableAttributedString()`** 构造函数创建一段可以改的富文本。

## 语法

```
new NSMutableAttributedString()
new NSMutableAttributedString(string)
new NSMutableAttributedString(string, attributes)
new NSMutableAttributedString(other)
```

### 参数

和 [`NSAttributedString()`](../ns-attributed-string/constructor.md) 相同：

**`string`**

文字。按字符串转：数字 `5` 得到 `'5'`，`null` 和 `undefined` 得到空串。

**`attributes`**

可选。整段文字用的一组[属性](../ns-attributed-string.md#富文本的属性)。给 `null` 等于没给。

**`other`**

另一个 `NSAttributedString`。照它抄一份；之后改新建的这个，不影响 `other`。

### 返回值

新建的 `NSMutableAttributedString`。

### 异常

**`TypeError`**

和 [`NSAttributedString()`](../ns-attributed-string/constructor.md) 相同：`attributes` 不是对象、属性名写错、属性值的类不对、颜色值是 `null`。不能继承。

## 示例

```js
const text = new NSMutableAttributedString('到手价 ', {
  font: UIFont.systemFontOfSize(15),
  foregroundColor: 'label',
});
text.appendAttributedString(new NSAttributedString('¥128', {
  font: UIFont.boldSystemFontOfSize(26),
  foregroundColor: 'systemRed',
}));
console.log(text.string);
```

**结果**：控制台输出 `到手价 ¥128`。

## 对应的 iOS API

`-[NSMutableAttributedString initWithString:attributes:]` 等，和 `NSAttributedString` 的四种初始化相同。

## 参见

- [`NSAttributedString()`](../ns-attributed-string/constructor.md)
