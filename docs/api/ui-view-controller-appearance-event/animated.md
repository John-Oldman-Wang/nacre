---
type: reference
native: UIViewControllerAppearanceEvent.animated
---

# `UIViewControllerAppearanceEvent`：`animated` 属性

**`animated`** 属性表示这一次出现或消失带不带转场动画。

## 值

布尔值。

- 只读。给它赋值抛 `TypeError`。
- `true`：带转场动画，比如推入、弹出时的滑动。
- `false`：没有动画，页面直接出现或消失。
- 值来自推入、弹出、呈现、关闭时给的 `animated` 选项。
- 用 [`new`](constructor.md) 创建时没给，是 `false`。

## 示例

```js
const page = new UIViewController();
page.addEventListener('beforeappear', (e) => {
  console.log('即将出现，带动画：' + e.animated);
});
```

**效果**：页面每次即将出现时，输出这一次带不带动画。

## 对应的 iOS API

`viewWillAppear:` 这一组方法的参数 `animated`。

## 参见

- [`UIViewControllerAppearanceEvent`](../ui-view-controller-appearance-event.md)
