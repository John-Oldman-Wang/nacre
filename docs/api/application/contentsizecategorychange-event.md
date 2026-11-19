---
type: reference
native: UIContentSizeCategoryDidChangeNotification
---

# `Application`：`contentsizecategorychange` 事件

**`contentsizecategorychange`** 事件在用户改了系统字体大小时派发。

## 语法

```
application.addEventListener('contentsizecategorychange', (event) => { })
```

## 事件对象

`Event`，只有基本字段。新的值从 [`application.contentSizeCategory`](contentsizecategory.md) 读。不能取消。

## 什么时候派发

- 用户在系统设置里改了字体大小时派发。
- 这个事件的派发**未在模拟器验证**。

## 示例

```js
application.addEventListener('contentsizecategorychange', () => {
  console.log('字体大小档位变成', application.contentSizeCategory);
});
```

**效果**：用户改了系统字体大小后输出新的档位。**未在模拟器验证。**

## 对应的 iOS API

`UIContentSizeCategoryDidChangeNotification`。

## 参见

- [`contentSizeCategory`](contentsizecategory.md)
