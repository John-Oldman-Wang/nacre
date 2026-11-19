---
type: reference
native: UIControl.touchInside
---

# `UIControl`：`isTouchInside` 属性

**`isTouchInside`** 属性表示正在跟踪的触摸此刻是否在控件范围内。

## 值

布尔值。

| 取值 | 含义 |
| --- | --- |
| `true` | 有一次触摸正在进行，手指此刻在控件范围内 |
| `false` | 手指此刻在控件范围外，或者没有触摸在进行 |

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `false`。**默认值未在模拟器验证。**

### 怎么得知它变了

它变了不派发事件。手指越过控件边界时派发 [`touchdragexit`](touchdragexit-event.md) 和 [`touchdragenter`](touchdragenter-event.md)。

## 示例

```js
const card = new UIControl();
card.addEventListener('touchdraginside', () => {
  console.log(card.isTouchInside);
});
```

**效果**：手指按住在 `card` 里移动时，控制台输出 `true`。回调排在触摸之后执行，手指快速移出时读到的可能已经是 `false`。**未在模拟器验证。**

## 对应的 iOS API

`UIControl.touchInside`，读取方法是 `isTouchInside`。

## 参见

- [`isTracking`](istracking.md)
- [触点位置](../ui-control.md#触点位置)：触摸事件带的手指位置
