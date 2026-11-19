---
type: reference
native: UIView.overrideUserInterfaceStyle
---

# `UIView`：`overrideUserInterfaceStyle` 属性

**`overrideUserInterfaceStyle`** 属性强制这个视图和它的子视图用浅色或深色，不管系统设置。

## 值

字符串，下面三个之一：

| 取值 | 效果 |
| --- | --- |
| `'unspecified'` | 跟随外层 |
| `'light'` | 强制浅色 |
| `'dark'` | 强制深色 |

- 可读，可写。
- 默认值是 `'unspecified'`。
- 写入之后这个属性立刻读得到新值，[`traitCollection`](traitcollection.md) 稍后才更新，更新完派发 [`traitchange`](traitchange-event.md)。依赖新值的代码写在 `traitchange` 的回调里，不要写在赋值的下一行，见[强制之后不是立刻生效](../ui-trait-collection.md#强制之后不是立刻生效)。
- 不在窗口里的视图，强制不体现在 `traitCollection` 上，见[外观特征](../ui-trait-collection.md#强制之后不是立刻生效)。

### 写错时

写入表里没有的值：不抛异常，控制台输出一条警告 `[Nacre] overrideUserInterfaceStyle has no value "night"; expected one of: unspecified / light / dark, ignored`，属性保持原值。

## 示例

```js
const card = new UIView();
card.backgroundColor = 'systemBackground';
card.overrideUserInterfaceStyle = 'dark';
```

**效果**：`card` 和它里面的视图按深色模式显示，`systemBackground` 显示为深色。

## 对应的 iOS API

`UIView.overrideUserInterfaceStyle`。`UIUserInterfaceStyleDark` 写成 `'dark'`。

## 参见

- [外观特征](../ui-trait-collection.md)
- [`traitCollection`](traitcollection.md)
