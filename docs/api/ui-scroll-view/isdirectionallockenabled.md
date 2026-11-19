---
type: reference
native: UIScrollView.directionalLockEnabled
---

# `UIScrollView`：`isDirectionalLockEnabled` 属性

**`isDirectionalLockEnabled`** 属性表示一次拖动是否只沿起步时的方向滚。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 一次拖动只沿起步时的方向滚 |
| `false` | 可以斜着滚 |

- 可读，可写。
- 默认值是 `false`。
- 两种取值的效果**未在模拟器验证**。
- 写别的类型的值时按 JS 的真假转换。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const scroller = new UIScrollView();
scroller.isDirectionalLockEnabled = true;
```

**效果**：先横着拖，这次拖动就只能横向滚。**未在模拟器验证。**

## 对应的 iOS API

`UIScrollView.directionalLockEnabled`（getter 是 `isDirectionalLockEnabled`）。
