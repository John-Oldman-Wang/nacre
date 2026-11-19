---
type: reference
native: "-[NSAttributedString isEqualToAttributedString:]"
---

# `NSAttributedString`：`isEqualToAttributedString()` 方法

**`isEqualToAttributedString()`** 方法比较两个富文本的内容：文字和每一处的属性都相同才算相同。

从视图上读回来的富文本是一份快照，每次读可能是不同的对象，所以比较内容用这个方法，不要用 `===`。

## 语法

```
isEqualToAttributedString(other)
```

### 参数

**`other`**

另一个 `NSAttributedString`。

### 返回值

布尔。文字和每一处的属性都相同是 `true`，否则是 `false`。

### 异常

**`TypeError`**

`other` 不是 `NSAttributedString`：`isEqualToAttributedString needs an NSAttributedString, got …`。

## 示例

```js
const text = new NSAttributedString('促销', { underlineStyle: ['single'] });
const label = new UILabel();
label.attributedText = text;
const back = label.attributedText;
console.log(back !== null && back.isEqualToAttributedString(text));
```

**结果**：控制台输出 `true`。**未在模拟器验证。**

## 对应的 iOS API

`-[NSAttributedString isEqualToAttributedString:]`。

## 参见

- [`UILabel.attributedText`](../ui-label/attributedtext.md)
