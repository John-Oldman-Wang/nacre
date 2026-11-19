---
type: reference
native: UIScrollView.bounces
---

# `UIScrollView`：`bounces` 属性

**`bounces`** 属性表示滚到头之后能不能再拉一段，松手弹回。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 滚到头后可以再拉一段，松手弹回 |
| `false` | 滚到头就停 |

- 可读，可写。
- 默认值是 `true`。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.bounces = false;
```

**效果**：滚到最顶或最底就停住，不能再往外拉。

## 对应的 iOS API

`UIScrollView.bounces`。

## 参见

- [`alwaysBounceVertical`](alwaysbouncevertical.md)
- [`bouncesVertically`](bouncesvertically.md)
