---
type: reference
native: UIView.hidden
---

# `UIView`：`isHidden` 属性

**`isHidden`** 属性决定视图是否隐藏。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 视图和它的子视图不显示，也不接收触摸 |
| `false` | 正常显示 |

- 可读，可写。
- 默认值是 `false`。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 隐藏的视图仍然在视图树里，仍然占着自己的 `frame`。只有放在 [`UIStackView`](../ui-stack-view.md) 里的视图，隐藏后才会让出位置。
- 之后还要显示的视图用 `isHidden`，它的属性、子视图和事件监听都保留；不再需要的视图用 [`removeFromSuperview()`](removefromsuperview.md)。

## 示例

```js
const card = new UIView();
card.isHidden = true;
// @ts-expect-error 类型只收布尔值，这里演示运行时按 Boolean() 转换
card.isHidden = 'false';
console.log(card.isHidden);
```

**效果**：视图隐藏。第二次写入的 `'false'` 是非空字符串，按 `Boolean()` 转换得到 `true`，所以视图仍然隐藏，控制台输出 `true`。隐藏后不接收触摸**未在模拟器验证**。

## 对应的 iOS API

`UIView.hidden`，ObjC 的读取名是 `isHidden`，JS 用这个名字读和写。

## 参见

- [`alpha`](alpha.md)
- [隐藏视图](../../guides/views.md#隐藏视图)
