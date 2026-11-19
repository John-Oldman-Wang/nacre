---
type: reference
native: UIViewController.overrideUserInterfaceStyle
---

# `UIViewController`：`overrideUserInterfaceStyle` 属性

**`overrideUserInterfaceStyle`** 属性强制这个页面和它里面的一切用浅色或深色，不管系统设置。

## 值

字符串：

| 取值 | 效果 |
| --- | --- |
| `'unspecified'` | 不强制，跟随外层 |
| `'light'` | 用浅色 |
| `'dark'` | 用深色 |

- 可读，可写。
- 默认值是 `'unspecified'`。
- 改了之后这个页面的 [`traitCollection`](traitcollection.md) 跟着变，并派发 [`traitchange`](traitchange-event.md)。
- 写错时的行为和其余要注意的地方见[外观特征](../ui-trait-collection.md)。

## 示例

```js
const page = new UIViewController();
page.view.backgroundColor = 'systemBackground';
page.overrideUserInterfaceStyle = 'dark';
console.log(page.overrideUserInterfaceStyle);
```

**结果**：控制台输出 `dark`。页面显示出来时底色是黑色，不管系统是不是深色模式。

## 对应的 iOS API

`UIViewController.overrideUserInterfaceStyle`。`UIUserInterfaceStyleDark` 写成 `'dark'`，其余同理。

## 参见

- [外观特征](../ui-trait-collection.md)
