---
type: reference
native: UIScrollView.alwaysBounceHorizontal
---

# `UIScrollView`：`alwaysBounceHorizontal` 属性

**`alwaysBounceHorizontal`** 属性表示内容不足一屏时，横向是否也能拉动并弹回。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 内容不足一屏时，横向也能拉动并弹回。需要 [`bounces`](bounces.md) 为 `true` |
| `false` | 内容不足一屏时横向拖不动 |

- 可读，可写。
- 默认值是 `false`。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.alwaysBounceHorizontal = true;
```

**效果**：内容不足一屏宽时，左右也能拉一小段，松手弹回。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.alwaysBounceHorizontal`。

## 参见

- [`alwaysBounceVertical`](alwaysbouncevertical.md)
