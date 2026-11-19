---
type: reference
native: UIScrollView.showsHorizontalScrollIndicator
---

# `UIScrollView`：`showsHorizontalScrollIndicator` 属性

**`showsHorizontalScrollIndicator`** 属性表示横向滚动时是否显示指示条。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 横向滚动时底部出现指示条 |
| `false` | 不显示 |

- 可读，可写。
- 默认值是 `true`。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.showsHorizontalScrollIndicator = false;
```

**效果**：横向滚动时底部不再出现指示条。

## 对应的 iOS API

`UIScrollView.showsHorizontalScrollIndicator`。

## 参见

- [`showsVerticalScrollIndicator`](showsverticalscrollindicator.md)
