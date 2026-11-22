---
type: reference
web: CustomEvent.detail
---

# `CustomEvent`：`detail` 属性

**`detail`** 属性是事件带的那份数据。

## 值

任意值。原生模块发来的事件里，是[能传给 JS 的那几种值](../native-module.md#能传什么值)之一；原生没给数据时是 `null`。

- 只读。给它赋值抛 `TypeError`。
- 是建事件时给的那个值本身，不复制。
- 用 [`new`](constructor.md) 创建时没给，是 `null`。

## 示例

```js
const target = new EventTarget();
target.addEventListener('ping', (e) => {
  if (e instanceof CustomEvent) {
    console.log(e.detail);
  }
});
target.dispatchEvent(new CustomEvent('ping', { detail: 42 }));
```

**效果**：控制台输出 `42`。

## 对应的 iOS API

原生模块用 `emitEvent:detail:` 发事件时给的 `detail`，见[写自己的原生模块](../../guides/native-modules.md)。

## 参见

- [`CustomEvent`](../custom-event.md)
