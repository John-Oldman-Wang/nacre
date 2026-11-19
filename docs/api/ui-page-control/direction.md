---
type: reference
native: UIPageControl.direction
---

# `UIPageControl`：`direction` 属性

**`direction`** 属性决定圆点往哪个方向排，也就是第 0 页在哪一头。

## 值

字符串，下面五个之一：

| 取值 | 效果 |
| --- | --- |
| `'natural'` | 跟系统语言的书写方向：中文、英文是从左到右，阿拉伯文是从右到左 |
| `'leftToRight'` | 横着排，第 0 页在最左 |
| `'rightToLeft'` | 横着排，第 0 页在最右 |
| `'topToBottom'` | 竖着排，第 0 页在最上 |
| `'bottomToTop'` | 竖着排，第 0 页在最下 |

- 可读，可写。
- 默认值是 `'natural'`。
- 竖着排时，[`sizeForNumberOfPages()`](sizefornumberofpages.md) 给出的大小也跟着变成窄而高的，要重新用它设一次 `frame`。**未在模拟器验证。**
- 各取值在屏幕上的效果**未在模拟器验证**。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告，列出全部可用的值，属性保持原来的值。

## 示例

```js
const pages = new UIPageControl();
pages.numberOfPages = 4;
pages.direction = 'topToBottom';
const size = pages.sizeForNumberOfPages(4);
pages.frame = new CGRect(0, 0, size.width, size.height);
```

**效果**：圆点从上到下排成一列，第 0 页在最上面。**未在模拟器验证。**

## 对应的 iOS API

`UIPageControl.direction`。`UIPageControlDirectionTopToBottom` 写成 `'topToBottom'`，其余同理。

## 参见

- [`sizeForNumberOfPages()`](sizefornumberofpages.md)
- [枚举](../enums.md)
