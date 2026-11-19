---
type: reference
native: "-[UIView invalidateIntrinsicContentSize]"
---

# `UIView`：`invalidateIntrinsicContentSize()` 方法

**`invalidateIntrinsicContentSize()`** 方法通知系统这个视图的固有大小变了，下次布局时重新读取。

## 语法

```
invalidateIntrinsicContentSize()
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
label.text = '更长的一段文字';
label.invalidateIntrinsicContentSize();
```

**效果**：下次布局时，系统重新读 `label` 的固有大小。`UILabel` 改文字时自己会通知系统，这里的调用只是演示写法。**未在模拟器验证。**

## 对应的 iOS API

`-[UIView invalidateIntrinsicContentSize]`。

## 参见

- [`intrinsicContentSize`](intrinsiccontentsize.md)
