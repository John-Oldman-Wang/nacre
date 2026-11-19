---
type: reference
native: UIScrollView.indicatorStyle
---

# `UIScrollView`：`indicatorStyle` 属性

**`indicatorStyle`** 属性是滚动指示条的颜色。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'default'` | 跟随浅色或深色模式自动选 |
| `'black'` | 深色的条，用在浅色内容上 |
| `'white'` | 浅色的条，用在深色内容上 |

- 可读，可写。
- 默认值是 `'default'`。
- 没有变化事件：改它的只有 App 自己的代码。

### 写错时

写了表里没有的值：不抛异常，属性保持原值，控制台输出一条警告，列出全部可选值：

```
[Nacre] indicatorStyle has no value "x"; expected one of: default / black / white, ignored
```

## 示例

```js
const scroller = new UIScrollView();
scroller.indicatorStyle = 'white';
```

**效果**：指示条是浅色的，在深色的内容上看得清。

## 对应的 iOS API

`UIScrollView.indicatorStyle`。`UIScrollViewIndicatorStyleBlack` 写成 `'black'`，其余同理。

## 参见

- [`showsVerticalScrollIndicator`](showsverticalscrollindicator.md)
