---
type: reference
native: "-[NSAttributedString copy]"
---

# `NSAttributedString`：`copy()` 方法

**`copy()`** 方法返回一份内容相同、不可改的副本。

## 语法

```
copy()
```

### 参数

无。

### 返回值

`NSAttributedString`，内容和原来的相同。对 `NSMutableAttributedString` 调用，得到的副本不可改，之后改原来的富文本不影响副本。

### 异常

无。

## 示例

```js
const text = new NSMutableAttributedString('abc');
const frozen = text.copy();
text.appendAttributedString(new NSAttributedString('d'));
console.log(frozen.string, text.string);
```

**结果**：控制台输出 `abc abcd`。

## 对应的 iOS API

`-[NSAttributedString copy]`。

## 参见

- [`mutableCopy()`](mutablecopy.md)
