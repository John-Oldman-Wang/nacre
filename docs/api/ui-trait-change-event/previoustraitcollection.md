---
type: reference
native: UITraitChangeEvent.previousTraitCollection
---

# `UITraitChangeEvent`：`previousTraitCollection` 属性

**`previousTraitCollection`** 属性是变化之前的那组值。

## 值

[`UITraitCollection`](../ui-trait-collection.md)。

- 只读。给它赋值抛 `TypeError`。
- 现在的值不在事件对象上，从 `event.target.traitCollection` 读，回调执行时它已经是新值。
- 比较两组值，就知道是哪一项变了。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const page = new UIViewController();
page.view.addEventListener('traitchange', (e) => {
  const before = e.previousTraitCollection.userInterfaceStyle;
  const now = page.view.traitCollection.userInterfaceStyle;
  if (before !== now) {
    console.log('切到了', now);
  }
});
```

**效果**：在系统设置里切换深色模式，输出 `切到了` 和新的样式，比如 `dark`。

## 对应的 iOS API

`registerForTraitChanges:withHandler:` 的处理块的参数 `previousCollection`。

## 参见

- [`UITraitChangeEvent`](../ui-trait-change-event.md)
