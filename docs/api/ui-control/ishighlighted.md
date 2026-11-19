---
type: reference
native: UIControl.highlighted
---

# `UIControl`：`isHighlighted` 属性

**`isHighlighted`** 属性表示控件是否处于 `highlighted` [状态](../ui-control.md#状态)，也就是手指是否按在控件上。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 控件进入 `highlighted` 状态。[`state`](state.md) 里有 `'highlighted'`。按钮会改用按住时的外观 |
| `false` | 控件离开 `highlighted` 状态 |

- 可读，可写。
- 默认值是 `false`。
- 手指按下时系统自动设为 `true`，松开或触摸被取消时设回 `false`。App 的代码也可以写。
- 写入按 JS 的真假值转换。

### 怎么得知它变了

它变了不派发事件。触摸的开始和结束用 [`touchdown`](touchdown-event.md) 和三个结束事件 [`touchupinside`](touchupinside-event.md)、[`touchupoutside`](touchupoutside-event.md)、[`touchcancel`](touchcancel-event.md) 得知。

> **注意**：不要在事件回调里靠读它判断手指是否按着。回调排在触摸之后执行，手指按下后很快松开时，`touchdown` 的回调里读到的可能已经是 `false`（实测），见[回调的执行时机](../ui-control.md#回调的执行时机)。按下时要改外观，在 `touchdown` 的回调里直接改。

## 示例

```js
const card = new UIControl();
card.isHighlighted = true;
console.log(card.state.includes('highlighted'));
```

**结果**：输出 `true`。

## 对应的 iOS API

`UIControl.highlighted`，读取方法是 `isHighlighted`。

## 参见

- [`isTracking`](istracking.md)：是否正在跟踪一次触摸
- [状态](../ui-control.md#状态)
