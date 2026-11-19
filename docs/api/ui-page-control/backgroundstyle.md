---
type: reference
native: UIPageControl.backgroundStyle
---

# `UIPageControl`：`backgroundStyle` 属性

**`backgroundStyle`** 属性决定圆点背后那块半透明的圆角底什么时候显示。有底时，点在任何颜色的内容上都看得清。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 平时没有底，手指按到这排点上时出现 |
| `'prominent'` | 一直有底 |
| `'minimal'` | 一直没有底 |

- 可读，可写。
- 默认值是 `'automatic'`。
- 各取值在屏幕上的效果**未在模拟器验证**。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，属性保持原来的值。

```
[Nacre] backgroundStyle has no value "glass"; expected one of: automatic / prominent / minimal, ignored
```

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 3;
pages.backgroundStyle = 'prominent';
console.log(pages.backgroundStyle);
```

**效果**：输出 `prominent`。圆点背后一直有一块圆角底。**底的样子未在模拟器验证。**

## 对应的 iOS API

`UIPageControl.backgroundStyle`。`UIPageControlBackgroundStyleProminent` 写成 `'prominent'`，其余同理。

## 参见

- [枚举](../enums.md)：属性写错时为什么是警告而不是抛异常
