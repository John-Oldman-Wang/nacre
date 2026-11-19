---
type: reference
native: UIScrollView.scrollEnabled
---

# `UIScrollView`：`isScrollEnabled` 属性

**`isScrollEnabled`** 属性表示用户能不能拖动滚动视图。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 用户可以拖动 |
| `false` | 用户拖不动。代码写 `contentOffset` 仍然有效 |

- 可读，可写。
- 默认值是 `true`。
- [`UITextView`](../ui-text-view.md) 上写 `false` 之后，它不再滚动，而是文字有几行就要多高。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.isScrollEnabled = false;
```

**效果**：用户拖不动。设回 `true` 恢复。

## 对应的 iOS API

`UIScrollView.scrollEnabled`（getter 是 `isScrollEnabled`）。

## 参见

- [`bounces`](bounces.md)
