---
type: reference
native: "-[UIView sizeToFit]"
---

# `UIView`：`sizeToFit()` 方法

**`sizeToFit()`** 方法把视图的大小改成刚好容纳内容的大小，位置不变。

## 语法

```
sizeToFit()
```

### 参数

无。

### 返回值

无（`undefined`）。

### 异常

无。

## 示例

```js
const label = new UILabel();
label.text = 'Hello, Nacre';
label.frame = new CGRect(40, 500, 0, 0);
label.sizeToFit();
```

**效果**：`label` 的左上角还在 `(40, 500)`，宽高变成文字的大小。

## 对应的 iOS API

`-[UIView sizeToFit]`。

## 参见

- [`sizeThatFits()`](sizethatfits.md)
