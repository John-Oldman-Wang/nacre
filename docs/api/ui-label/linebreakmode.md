---
type: reference
native: UILabel.lineBreakMode
---

# `UILabel`：`lineBreakMode` 属性

**`lineBreakMode`** 属性决定文字放不下时怎么处理：在哪里换行，最后一行放不下的部分是否显示省略号、省略号放在哪。

## 值

字符串，下面六个之一：

| 取值 | 效果 |
| --- | --- |
| `'byTruncatingTail'` | 末尾放不下的部分换成「…」 |
| `'byTruncatingHead'` | 开头的部分换成「…」，保留结尾。**未在模拟器验证** |
| `'byTruncatingMiddle'` | 中间的部分换成「…」，保留开头和结尾。适合文件名、地址这类两端都有信息的内容。**未在模拟器验证** |
| `'byClipping'` | 放不下的部分不显示，没有省略号。**未在模拟器验证** |
| `'byWordWrapping'` | 在单词的边界换行。最后一行放不下的部分不显示，没有省略号。**未在模拟器验证** |
| `'byCharWrapping'` | 在任意字符之间换行，可以把一个单词拆开。最后一行放不下的部分不显示，没有省略号。**未在模拟器验证** |

- 可读，可写。
- 默认值是 `'byTruncatingTail'`。

### 写错时

写入表外的值时不抛异常：属性保持原来的值，控制台输出一条警告，省略号处列出全部可用的值：

```
[Nacre] lineBreakMode has no value "ellipsis"; expected one of: …, ignored
```

## 示例

```js
const label = new UILabel();
label.text = '/Users/me/Documents/projects/nacre/docs/api/ui-label.md';
label.numberOfLines = 1;
label.lineBreakMode = 'byTruncatingMiddle';
```

**效果**：文字只显示一行。开头和结尾保留，中间的部分换成「…」。**未在模拟器验证。**

## 对应的 iOS API

`UILabel.lineBreakMode`。`NSLineBreakByTruncatingTail` 写成 `'byTruncatingTail'`，其余同理。

## 参见

- [`numberOfLines`](numberoflines.md)
- [行数、换行和截断](../ui-label.md#行数换行和截断)
