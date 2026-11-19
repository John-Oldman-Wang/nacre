---
type: reference
native: UIViewController.modalTransitionStyle
---

# `UIViewController`：`modalTransitionStyle` 属性

**`modalTransitionStyle`** 属性是这个页面被模态呈现时的进出动画。它设在**被弹出的页面**上，在弹出之前设。

## 值

字符串：

| 取值 | 效果 |
| --- | --- |
| `'coverVertical'` | 从屏幕底部向上滑入，关闭时向下滑出 |
| `'crossDissolve'` | 原地淡入，关闭时淡出。**未在模拟器验证** |
| `'flipHorizontal'` | 像翻牌一样水平翻转到新页面。**未在模拟器验证** |
| `'partialCurl'` | 翻页的卷角效果。**未在模拟器验证** |

- 可读，可写。
- 默认值是 `'coverVertical'`。
- 变化时不派发事件：它只能被 App 的代码修改。

### 写错时

写入表里没有的值：不抛异常，属性保持原来的值，控制台输出一条警告 `[Nacre] modalTransitionStyle has no value "<写的值>"; expected one of: …, ignored`。

## 示例

```js
const page = new UIViewController();
const sheet = new UIViewController();
sheet.modalTransitionStyle = 'crossDissolve';
page.presentViewController(sheet, { animated: true });
```

**效果**：`sheet` 不从底部滑入，而是原地淡入。关闭时淡出。**未在模拟器验证。**

## 对应的 iOS API

`UIViewController.modalTransitionStyle`。`UIModalTransitionStyleCrossDissolve` 写成 `'crossDissolve'`，其余同理。

## 参见

- [`modalPresentationStyle`](modalpresentationstyle.md)
