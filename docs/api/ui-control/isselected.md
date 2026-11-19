---
type: reference
native: UIControl.selected
---

# `UIControl`：`isSelected` 属性

**`isSelected`** 属性表示控件是否处于 `selected` [状态](../ui-control.md#状态)。它的含义由 App 自己决定，比如「已关注」「已收藏」。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `true` | 控件进入 `selected` 状态。[`state`](state.md) 里有 `'selected'`。按钮会改用给 `selected` 状态设的文字和颜色 |
| `false` | 控件离开 `selected` 状态 |

- 可读，可写。
- 默认值是 `false`。
- 系统不会自动改它。点一下切换的控件，要在点击的回调里自己改。
- 写入按 JS 的真假值转换。

### 怎么得知它变了

它变了不派发事件。只有 App 的代码会改它，不需要通知。

## 示例

```js
const card = new UIControl();
card.backgroundColor = 'systemGreen';
card.addEventListener('touchupinside', () => {
  card.isSelected = !card.isSelected;
  card.backgroundColor = card.isSelected ? 'systemGray' : 'systemGreen';
});
```

**效果**：点一下，底色变成灰色；再点一下变回绿色。**未在模拟器验证。**

## 对应的 iOS API

`UIControl.selected`，读取方法是 `isSelected`。

## 参见

- [`state`](state.md)
- [`UIButton`](../ui-button.md)：按状态设文字，做「关注 / 已关注」的按钮
