---
type: reference
native: UIView.accessibilityViewIsModal
---

# `UIView`：`accessibilityViewIsModal` 属性

**`accessibilityViewIsModal`** 属性决定读屏是否只在这个视图里面转：设成 `true` 之后，读屏跳过和它同一个父视图的其他视图里的元素。盖在页面上的弹层用它。

读屏（VoiceOver，系统设置里叫「旁白」）是 iOS 自带的屏幕阅读器，见 [`isAccessibilityElement`](isaccessibilityelement.md)。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 读屏跳过这个视图的兄弟视图（同一个父视图下的其他子视图）里的元素，只停在这个视图里面的元素上 |
| `false` | 读屏照常停在所有看得见的元素上 |

两种取值的效果来自 Apple 的文档，**未在真机验证**。

- 可读，可写。
- 默认值是 `false`。
- 只跳过兄弟视图里的元素。按 Apple 的文档，父视图的兄弟视图不受影响：弹层要直接加在要盖住的那些视图的父视图上，比如页面的根视图。
- 只影响读屏，不影响显示和触摸。弹层没有盖住的地方，手指照样点得动下面的视图。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

```js
const page = new UIViewController();
const sheet = new UIView();
sheet.backgroundColor = 'systemBackground';
sheet.accessibilityViewIsModal = true;
page.view.addSubview(sheet);
console.log(sheet.accessibilityViewIsModal);
```

**效果**：控制台输出 `true`。弹层 `sheet` 加到页面的根视图上之后，读屏只停在 `sheet` 里面的元素上，页面上被它盖住的按钮和文字都跳过。**读屏的效果未在真机验证。**

## 对应的 iOS API

`accessibilityViewIsModal`。在 iOS 里它属于 `UIAccessibility` 协议，任何对象都有；JS 里只在 `UIView` 和它的子类上有。

## 参见

- [让读屏念对你的界面](../../guides/accessibility.md#弹层让读屏只在里面转)：自己做的弹层怎么设
- [`accessibilityElementsHidden`](accessibilityelementshidden.md)：跳过一个视图里面的全部元素
