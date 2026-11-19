---
type: reference
native: UITraitCollection.userInterfaceStyle
---

# `UITraitCollection`：`userInterfaceStyle` 属性

**`userInterfaceStyle`** 属性表示界面现在是深色还是浅色。

## 值

字符串：

| 取值 | 含义 |
| --- | --- |
| `'light'` | 浅色 |
| `'dark'` | 深色 |
| `'unspecified'` | 没有指定。从 `traitCollection` 读时实测没有遇到过，只在 `overrideUserInterfaceStyle` 上出现 |

- 从 `traitCollection` 读到的实测只有 `'light'` 和 `'dark'` 两种，所以不是 `'dark'` 就是浅色。
- 场景上读到的是系统设置；视图上读到的是这个视图实际显示的外观，可能被 `overrideUserInterfaceStyle` 强制过，见[强制深浅色](../ui-trait-collection.md#强制深浅色overrideuserinterfacestyle)。
- 还没加到界面上的视图也读得到，是系统当前的设置。

- 只读。给它赋值抛 `TypeError`。
- 它是读 `traitCollection` 那一刻的值，之后不会变。环境变了时，视图、页面、场景派发 [`traitchange`](../ui-trait-collection.md#traitchange-事件)，要新的值就重新读 `traitCollection`。

## 示例

```js
const view = new UIView();
const dark = view.traitCollection.userInterfaceStyle === 'dark';
console.log(dark ? '深色' : '浅色');
```

**结果**：系统是深色时输出 `深色`，否则输出 `浅色`。

## 对应的 iOS API

`UITraitCollection.userInterfaceStyle`。

## 参见

- [`UITraitCollection`](../ui-trait-collection.md)
- [适配深色模式](../../guides/dark-mode.md)
