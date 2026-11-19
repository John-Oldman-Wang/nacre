---
type: reference
native: UIViewController.modalInPresentation
---

# `UIViewController`：`isModalInPresentation` 属性

**`isModalInPresentation`** 属性决定用户能不能向下拖走这个模态页。

## 值

布尔值。

| 取值 | 效果 |
| --- | --- |
| `false` | 卡片式的模态页可以被用户向下拖走 |
| `true` | 用户拖不走，只能由代码 [`dismissViewController()`](dismissviewcontroller.md) 关闭。用户尝试拖动时派发 [`dismissattempt`](dismissattempt-event.md)，`beforedismiss` 和 `dismiss` 都不派发 |

- 可读，可写。
- 默认值是 `false`。
- 写入时按 `Boolean()` 转换。
- 可以在页面弹出之后随时改，比如表单被修改后设成 `true`，保存后设回 `false`。实测：弹出之后改成 `true`，再拖只收到 `dismissattempt`。
- 变化时不派发事件：它只能被 App 的代码修改。

## 示例

```js
const sheet = new UIViewController();
sheet.isModalInPresentation = true;
sheet.addEventListener('dismissattempt', () => {
  console.log('用户想关闭，但被拦住了');
});
```

**效果**：`sheet` 被弹出后，用户每向下拖一次，卡片不关闭，控制台输出一行。

## 对应的 iOS API

`UIViewController.modalInPresentation`。JS 里叫 `isModalInPresentation`。它也代替了 `presentationControllerShouldDismiss:` 那个同步回调：「让不让关」预先声明，不在回调里同步决定。

## 参见

- [`dismissattempt`](dismissattempt-event.md)
