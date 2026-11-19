---
type: reference
native: UIScrollView.showsVerticalScrollIndicator
---

# `UIScrollView`：`showsVerticalScrollIndicator` 属性

**`showsVerticalScrollIndicator`** 属性表示纵向滚动时是否显示指示条。指示条是滚动时出现在边缘的细条，表示当前位置。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 纵向滚动时右侧出现指示条 |
| `false` | 不显示 |

- 可读，可写。
- 默认值是 `true`。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.showsVerticalScrollIndicator = false;
```

**效果**：滚动时右侧不再出现指示条。

## 对应的 iOS API

`UIScrollView.showsVerticalScrollIndicator`。

## 参见

- [`showsHorizontalScrollIndicator`](showshorizontalscrollindicator.md)
- [`flashScrollIndicators()`](flashscrollindicators.md)
