---
type: reference
native: "-[NSParagraphStyle copy]"
---

# `NSParagraphStyle`：`copy()` 方法

**`copy()`** 方法返回一份值相同、不可改的副本。

## 语法

```
copy()
```

### 参数

无。

### 返回值

`NSParagraphStyle`，属性值和原来的相同。对 `NSMutableParagraphStyle` 调用，之后改原来的不影响副本。

### 异常

无。

## 示例

```js
const style = new NSMutableParagraphStyle();
style.lineSpacing = 8;
const frozen = style.copy();
style.lineSpacing = 2;
console.log(frozen.lineSpacing);
```

**结果**：控制台输出 `8`。

## 对应的 iOS API

`-[NSParagraphStyle copy]`。

## 参见

- [`mutableCopy()`](mutablecopy.md)
