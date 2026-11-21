---
type: reference
native: UIView.accessibilityElementsHidden
---

# `UIView`：`accessibilityElementsHidden` 属性

**`accessibilityElementsHidden`** 属性决定读屏是否跳过这个视图里面的全部元素。视图照常显示在屏幕上，只是读屏不停在它们上面。

读屏（VoiceOver，系统设置里叫「旁白」）是 iOS 自带的屏幕阅读器，见 [`isAccessibilityElement`](isaccessibilityelement.md)。

## 值

布尔。

| 取值 | 效果 |
| --- | --- |
| `true` | 读屏跳过这个视图里面的元素：它的子视图，以及子视图里面的视图 |
| `false` | 读屏照常停在里面的元素上 |

两种取值的效果来自 Apple 的文档，**未在真机验证**。

- 可读，可写。
- 默认值是 `false`。
- 写入时按 `Boolean()` 转换：`1`、非空字符串、对象都是 `true`；`0`、`''`、`null`、`undefined`、`NaN` 都是 `false`。所以写 `'false'` 得到 `true`。
- 只影响读屏，不影响显示和触摸：里面的按钮看得见，手指照样点得动。
- 没有变化事件：改它的只有 App 自己的代码。

## 示例

一块纯装饰的背景图案，读屏不该停在上面：

```js
const decoration = new UIView();
decoration.addSubview(new UIImageView());
decoration.addSubview(new UIImageView());
decoration.accessibilityElementsHidden = true;
console.log(decoration.accessibilityElementsHidden);
```

**效果**：控制台输出 `true`。读屏跳过 `decoration` 里的两张图，屏幕上它们照常显示。**读屏的效果未在真机验证。**

## 对应的 iOS API

`accessibilityElementsHidden`。在 iOS 里它属于 `UIAccessibility` 协议，任何对象都有；JS 里只在 `UIView` 和它的子类上有。

## 参见

- [让读屏念对你的界面](../../guides/accessibility.md)
- [`accessibilityViewIsModal`](accessibilityviewismodal.md)：弹层盖住页面时，让读屏只在弹层里转
- [`isAccessibilityElement`](isaccessibilityelement.md)
