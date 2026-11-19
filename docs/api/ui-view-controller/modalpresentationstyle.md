---
type: reference
native: UIViewController.modalPresentationStyle
---

# `UIViewController`：`modalPresentationStyle` 属性

**`modalPresentationStyle`** 属性是这个页面被模态呈现时的样式。它设在**被弹出的页面**上，在弹出之前设。

## 值

字符串：

| 取值 | 效果 |
| --- | --- |
| `'automatic'` | 由系统选一种样式。这是 iOS 的默认值 |
| `'pageSheet'` | 卡片。从底部滑入，用户可以向下拖走 |
| `'formSheet'` | 卡片。在 iPhone 上的样子和 `'pageSheet'` 的差别**未在模拟器验证** |
| `'fullScreen'` | 占满整个屏幕，完全盖住下面的页面。用户不能向下拖走。**未在模拟器验证** |
| `'overFullScreen'` | 占满整个屏幕，但下面的页面仍然保留在屏幕上。模态页的底色是半透明时，能透出下面的页面。**未在模拟器验证** |
| `'currentContext'` | 只盖住「定义了呈现范围」的那个页面。定义呈现范围的属性（`definesPresentationContext`）还没有提供。**未在模拟器验证** |
| `'overCurrentContext'` | 同 `'currentContext'`，并且下面的页面仍然保留。**未在模拟器验证** |
| `'popover'` | 气泡。需要的配置对象还没有提供。**未在模拟器验证** |
| `'custom'` | 自定义转场。需要的能力还没有提供。**未在模拟器验证** |
| `'none'` | 表示「不呈现」。不用于弹出页面。**设成它再弹出的结果未在模拟器验证** |

- 可读，可写。
- 新建的页面读出来是 `'formSheet'`，不是 `'automatic'`：系统返回的是它选定的具体样式。不要拿读出的值和 `'automatic'` 比较。
- 变化时不派发事件：它只能被 App 的代码修改。

`'fullScreen'` 的页面用户不能向下拖走，所以页面上必须有一个关闭按钮，否则用户没有办法离开这个页面。

### 写错时

写入表里没有的值：不抛异常，属性保持原来的值，控制台输出一条警告，列出所有可用的值：

```
[Nacre] modalPresentationStyle has no value "modal"; expected one of: …, ignored
```

## 示例

```js
const page = new UIViewController();
const sheet = new UIViewController();
console.log(sheet.modalPresentationStyle);
sheet.modalPresentationStyle = 'fullScreen';
page.presentViewController(sheet, { animated: true });
```

**效果**：先输出 `formSheet`。`page` 在屏幕上时，`sheet` 从底部滑入，占满整个屏幕。**全屏的效果未在模拟器验证。**

## 对应的 iOS API

`UIViewController.modalPresentationStyle`。`UIModalPresentationPageSheet` 写成 `'pageSheet'`，其余同理。

## 参见

- [`modalTransitionStyle`](modaltransitionstyle.md)
- [`isModalInPresentation`](ismodalinpresentation.md)
