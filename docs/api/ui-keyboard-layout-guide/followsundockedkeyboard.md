---
type: reference
native: UIKeyboardLayoutGuide.followsUndockedKeyboard
---

# `UIKeyboardLayoutGuide`：`followsUndockedKeyboard` 属性

**`followsUndockedKeyboard`** 属性决定键盘离开屏幕底部时 layout guide 是否还跟随它。

## 值

布尔。

- 可读，可写。
- 默认值是 `false`。读写和默认值在验收用例里断言过。
- 没有变化通知。只有 App 自己的代码会改它。

| 取值 | 效果 |
| --- | --- |
| `true` | 键盘离开屏幕底部时（iPad 上可以浮动、拆分的键盘）也跟随它 |
| `false` | 键盘离开屏幕底部时当作没有键盘 |

只和 iPad 上可以浮动、拆分的键盘有关。Nacre 只支持 iPhone，在 iPhone 上设它的效果**未在模拟器验证**。

- 写入时按 `Boolean()` 转换。

## 示例

```js
const guide = new UIView().keyboardLayoutGuide;
console.log(guide.followsUndockedKeyboard);
guide.followsUndockedKeyboard = true;
console.log(guide.followsUndockedKeyboard);
```

**结果**：依次输出 `false`、`true`。

## 对应的 iOS API

`UIKeyboardLayoutGuide.followsUndockedKeyboard`。

## 参见

- [`UIKeyboardLayoutGuide`](../ui-keyboard-layout-guide.md)
