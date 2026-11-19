---
type: reference
native: "-[NSMutableAttributedString setAttributedString:]"
---

# `NSMutableAttributedString`：`setAttributedString()` 方法

**`setAttributedString()`** 方法把全部内容换成另一个富文本的内容：文字和属性都换掉。

## 语法

```
setAttributedString(other)
```

### 参数

**`other`**

一个 `NSAttributedString`。之后改 `other` 不影响这一个。

### 返回值

无（`undefined`）。

### 异常

**`TypeError`**

`other` 不是 `NSAttributedString`：`setAttributedString needs an NSAttributedString, got …`。

## 示例

```js
const text = new NSMutableAttributedString('旧内容', { kern: 3 });
text.setAttributedString(new NSAttributedString('新内容'));
console.log(text.string, text.attribute('kern', { atIndex: 0 }));
```

**结果**：控制台输出 `新内容 null`。

## 对应的 iOS API

`-[NSMutableAttributedString setAttributedString:]`。

## 参见

- [`replaceCharactersInRange()`](replacecharactersinrange.md)
