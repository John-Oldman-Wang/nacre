---
type: reference
native: UIControl.state
---

# `UIControl`：`state` 属性

**`state`** 属性是控件当前的全部[状态](../ui-control.md#状态)，由 [`isEnabled`](isenabled.md)、[`isSelected`](isselected.md)、[`isHighlighted`](ishighlighted.md) 合成。

## 值

状态名的数组。状态名是下面几个字符串：

| 状态名 | 什么时候在数组里 |
| --- | --- |
| `'normal'` | 下面四个都不成立。这时数组只有这一项 |
| `'highlighted'` | `isHighlighted` 是 `true` |
| `'disabled'` | `isEnabled` 是 `false` |
| `'selected'` | `isSelected` 是 `true` |
| `'focused'` | 控件拥有焦点。**什么时候会得到焦点未在模拟器验证** |

- 只读。给它赋值抛 `TypeError`。
- 默认值是 `['normal']`。
- 几个状态同时成立时，数组里有几项。各项的顺序没有保证，判断某个状态用 `includes()`，不要按下标取。

### 怎么得知它变了

它变了不派发事件，原因见[状态](../ui-control.md#状态)。要改变状态，写 `isEnabled`、`isSelected`、`isHighlighted`。

## 示例

```js
const card = new UIControl();
console.log(card.state.join(', '));

card.isSelected = true;
card.isEnabled = false;
console.log(card.state.includes('disabled'), card.state.includes('selected'));
```

**结果**：先输出 `normal`，再输出 `true true`。

## 对应的 iOS API

`UIControl.state`。原生是位掩码，`state & UIControlStateSelected` 写成 `state.includes('selected')`。

## 参见

- [状态](../ui-control.md#状态)
- [`UIButton.setTitle()`](../ui-button/settitle.md)：按状态设文字，`forState` 用的是同一组状态名
