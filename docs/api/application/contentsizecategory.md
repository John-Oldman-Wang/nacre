---
type: reference
native: UIApplication.preferredContentSizeCategory
---

# `Application`：`contentSizeCategory` 属性

**`contentSizeCategory`** 属性是用户在系统设置里选的字体大小档位。

## 值

字符串，值是 iOS 的原始字符串，比如 `'UICTContentSizeCategoryL'`。`L` 是默认档。

- 只读。给它赋值抛 `TypeError`。
- 变化时派发 [`contentsizecategorychange`](contentsizecategorychange-event.md)。
- 还不能读成 `'large'` 这类统一的名字。

## 示例

```js
console.log(application.contentSizeCategory);
```

**结果**：字体大小是默认档时输出 `UICTContentSizeCategoryL`。

## 对应的 iOS API

`UIApplication.preferredContentSizeCategory`。

## 参见

- [`contentsizecategorychange`](contentsizecategorychange-event.md)
