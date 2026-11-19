---
type: reference
native: NSTextContainer.lineBreakMode
---

# `NSTextContainer`：`lineBreakMode` 属性

**`lineBreakMode`** 属性决定一行排不下时怎么处理。

## 值

字符串，下面几个之一：

| 取值 | 效果 |
| --- | --- |
| `'byWordWrapping'` | 在词的边界换行 |
| `'byCharWrapping'` | 在任意字符之间换行 |
| `'byClipping'` | 不换行，超出的部分不显示 |
| `'byTruncatingHead'` | 省略号在开头 |
| `'byTruncatingTail'` | 省略号在结尾 |
| `'byTruncatingMiddle'` | 省略号在中间 |

- 可读，可写。
- 默认值是 `'byWordWrapping'`。
- 各个取值的显示效果**未在模拟器验证**。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写入不在取值表里的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

```
[Nacre] lineBreakMode has no value "x"; expected one of: …, ignored
```

## 示例

```js
const container = new UITextView().textContainer;
container.lineBreakMode = 'byCharWrapping';
console.log(container.lineBreakMode);
```

**效果**：控制台输出 `byCharWrapping`。

## 对应的 iOS API

`NSTextContainer.lineBreakMode`。`NSLineBreakByTruncatingTail` 写成 `'byTruncatingTail'`，其余同理。

## 参见

- [`maximumNumberOfLines`](maximumnumberoflines.md)
